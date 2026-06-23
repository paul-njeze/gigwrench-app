import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin oversight inbox. Reads chat threads across every user via the
// service-role client, behind a strict admin gate, for support and
// moderation. This route is read only: it never writes read_at, so an
// admin opening a conversation never marks a party's message as read.
//
// List mode (no jobId): one entry per job that has at least one message,
// with both parties named, a message count, and the latest message preview.
// Detail mode (?jobId=): the full conversation for one job, with both the
// assigned Pro and the customer, and every message in order.
//
// Schema notes honored here: jobs.pro_id references pro_profiles and
// jobs.customer_id references customer_profiles, but both ids equal the
// matching profiles id, so profiles are always fetched by id directly and
// never embedded on jobs.

type JobRow = {
  id: string
  title: string | null
  status: string
  pro_id: string | null
  customer_id: string | null
  scheduled_at: string | null
}

type MsgRow = {
  id: string
  job_id: string
  sender_id: string | null
  recipient_id: string | null
  original_text: string
  original_language: string
  translated_text: string | null
  translated_language: string | null
  message_type: string
  read_at: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  language: string | null
  role: string | null
}

function svcClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function fullName(p: ProfileRow | null | undefined): string {
  if (!p) return ''
  return `${p.first_name || ''} ${p.last_name || ''}`.trim()
}

// Verify the caller is an admin. Returns the service client on success,
// or a NextResponse error to return directly on failure.
async function gate(req: NextRequest): Promise<{ svc: ReturnType<typeof svcClient> } | { error: NextResponse }> {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: auth } } },
  )
  const { data: { user }, error: userError } = await anon.auth.getUser()
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const svc = svcClient()
  const { data: adminRow } = await svc
    .from('admin_users').select('level').eq('profile_id', user.id).maybeSingle()
  if (!adminRow) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { svc }
}

export async function GET(req: NextRequest) {
  try {
    const gated = await gate(req)
    if ('error' in gated) return gated.error
    const { svc } = gated

    const jobId = req.nextUrl.searchParams.get('jobId')

    // Detail mode: full conversation for one job.
    if (jobId) {
      const { data: jobRaw } = await svc
        .from('jobs')
        .select('id,title,status,pro_id,customer_id,scheduled_at')
        .eq('id', jobId)
        .maybeSingle()
      const job = jobRaw as unknown as JobRow | null
      if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      async function profile(id: string | null): Promise<ProfileRow | null> {
        if (!id) return null
        const { data } = await svc
          .from('profiles')
          .select('id,first_name,last_name,avatar_url,language,role')
          .eq('id', id)
          .maybeSingle()
        return data as unknown as ProfileRow | null
      }

      const pro = await profile(job.pro_id)
      const customer = await profile(job.customer_id)

      const { data: msgsRaw } = await svc
        .from('messages')
        .select('id,job_id,sender_id,recipient_id,original_text,original_language,translated_text,translated_language,message_type,read_at,created_at')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })
        .limit(500)
      const msgs = (msgsRaw || []) as unknown as MsgRow[]

      const nameById: Record<string, string> = {}
      if (pro) nameById[pro.id] = fullName(pro) || 'Pro'
      if (customer) nameById[customer.id] = fullName(customer) || 'Customer'

      const messages = msgs.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_id ? (nameById[m.sender_id] || 'Unknown') : 'System',
        senderRole: pro && m.sender_id === pro.id ? 'pro' : customer && m.sender_id === customer.id ? 'customer' : 'system',
        originalText: m.original_text,
        originalLanguage: m.original_language,
        translatedText: m.translated_text,
        translatedLanguage: m.translated_language,
        messageType: m.message_type,
        createdAt: m.created_at,
        readAt: m.read_at,
      }))

      return NextResponse.json({
        job: { id: job.id, title: job.title || 'Job', status: job.status, scheduledAt: job.scheduled_at },
        pro: pro ? { id: pro.id, name: fullName(pro) || 'Pro', avatarUrl: pro.avatar_url, language: pro.language || 'en' } : null,
        customer: customer ? { id: customer.id, name: fullName(customer) || 'Customer', avatarUrl: customer.avatar_url, language: customer.language || 'en' } : null,
        messages,
      })
    }

    // List mode: every job that has at least one message.
    const { data: msgsRaw } = await svc
      .from('messages')
      .select('id,job_id,sender_id,original_text,translated_text,message_type,created_at')
      .order('created_at', { ascending: false })
      .limit(4000)
    const msgs = (msgsRaw || []) as unknown as MsgRow[]

    const countByJob: Record<string, number> = {}
    const lastByJob: Record<string, MsgRow> = {}
    for (const m of msgs) {
      countByJob[m.job_id] = (countByJob[m.job_id] || 0) + 1
      if (!lastByJob[m.job_id]) lastByJob[m.job_id] = m
    }

    const jobIds = Object.keys(countByJob)
    if (jobIds.length === 0) return NextResponse.json({ threads: [], total: 0 })

    const { data: jobsRaw } = await svc
      .from('jobs')
      .select('id,title,status,pro_id,customer_id,scheduled_at')
      .in('id', jobIds)
      .limit(2000)
    const jobs = (jobsRaw || []) as unknown as JobRow[]

    const partyIds = new Set<string>()
    for (const j of jobs) {
      if (j.pro_id) partyIds.add(j.pro_id)
      if (j.customer_id) partyIds.add(j.customer_id)
    }
    for (const m of Object.values(lastByJob)) {
      if (m.sender_id) partyIds.add(m.sender_id)
    }

    const pmap: Record<string, ProfileRow> = {}
    if (partyIds.size) {
      const { data: profs } = await svc
        .from('profiles')
        .select('id,first_name,last_name,avatar_url,language,role')
        .in('id', Array.from(partyIds))
      for (const p of (profs || []) as unknown as ProfileRow[]) pmap[p.id] = p
    }

    const threads = jobs.map((j) => {
      const last = lastByJob[j.id] || null
      const pro = j.pro_id ? pmap[j.pro_id] : null
      const customer = j.customer_id ? pmap[j.customer_id] : null
      const lastSender = last?.sender_id ? pmap[last.sender_id] : null
      return {
        jobId: j.id,
        title: j.title || 'Job',
        status: j.status,
        pro: pro ? { id: pro.id, name: fullName(pro) || 'Pro', avatarUrl: pro.avatar_url } : null,
        customer: customer ? { id: customer.id, name: fullName(customer) || 'Customer', avatarUrl: customer.avatar_url } : null,
        messageCount: countByJob[j.id] || 0,
        lastMessage: last
          ? { text: last.original_text, at: last.created_at, senderName: fullName(lastSender) || 'Unknown' }
          : null,
        lastActivityAt: last ? last.created_at : (j.scheduled_at || null),
      }
    })

    threads.sort((a, b) => {
      const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      return bt - at
    })

    return NextResponse.json({ threads, total: threads.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
