import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Thread list for the signed-in user. One entry per job the caller is a party
// to, where a message already exists or the job is active or upcoming. Each
// entry carries the counterparty's name and avatar, a preview of the latest
// message rendered in the caller's own language, and the caller's unread count.
// Service-role reads behind a party scope; profiles fetched separately by id.

const ACTIVE = ['scheduled', 'confirmed', 'on_the_way', 'in_progress']

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
  read_at: string | null
  created_at: string
}

type MiniProfile = { id: string; first_name: string | null; avatar_url: string | null }

function svcClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: auth } } },
    )
    const { data: { user } } = await anon.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const svc = svcClient()

    const { data: meRaw } = await svc.from('profiles').select('language').eq('id', userId).maybeSingle()
    const myLang = (meRaw as unknown as { language: string | null } | null)?.language || 'en'

    const { data: jobsRaw } = await svc
      .from('jobs')
      .select('id,title,status,pro_id,customer_id,scheduled_at')
      .or(`pro_id.eq.${userId},customer_id.eq.${userId}`)
      .limit(500)
    const jobs = (jobsRaw || []) as unknown as JobRow[]
    if (jobs.length === 0) return NextResponse.json({ ok: true, threads: [], unreadTotal: 0 })

    const jobIds = jobs.map((j) => j.id)

    const { data: msgsRaw } = await svc
      .from('messages')
      .select('id,job_id,sender_id,recipient_id,original_text,original_language,translated_text,translated_language,read_at,created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(2000)
    const msgs = (msgsRaw || []) as unknown as MsgRow[]

    const lastByJob: Record<string, MsgRow> = {}
    const unreadByJob: Record<string, number> = {}
    for (const m of msgs) {
      if (!lastByJob[m.job_id]) lastByJob[m.job_id] = m
      if (m.recipient_id === userId && !m.read_at) unreadByJob[m.job_id] = (unreadByJob[m.job_id] || 0) + 1
    }

    const included = jobs.filter((j) => lastByJob[j.id] || ACTIVE.includes(j.status))

    const cpIds = Array.from(
      new Set(included.map((j) => (j.pro_id === userId ? j.customer_id : j.pro_id)).filter(Boolean)),
    ) as string[]

    const cpMap: Record<string, MiniProfile> = {}
    if (cpIds.length) {
      const { data: cps } = await svc.from('profiles').select('id,first_name,avatar_url').in('id', cpIds)
      for (const p of (cps || []) as unknown as MiniProfile[]) cpMap[p.id] = p
    }

    function preview(m: MsgRow): string {
      if (m.translated_text && m.translated_language === myLang) return m.translated_text
      return m.original_text
    }

    const threads = included.map((j) => {
      const cpId = j.pro_id === userId ? j.customer_id : j.pro_id
      const cp = cpId ? cpMap[cpId] : null
      const last = lastByJob[j.id] || null
      return {
        jobId: j.id,
        title: j.title || 'Job',
        status: j.status,
        counterparty: {
          id: cpId,
          firstName: cp?.first_name || '',
          avatarUrl: cp?.avatar_url || null,
        },
        lastMessage: last
          ? { text: preview(last), at: last.created_at, fromMe: last.sender_id === userId }
          : null,
        unread: unreadByJob[j.id] || 0,
        scheduledAt: j.scheduled_at,
      }
    })

    threads.sort((a, b) => {
      const at = a.lastMessage ? new Date(a.lastMessage.at).getTime() : (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0)
      const bt = b.lastMessage ? new Date(b.lastMessage.at).getTime() : (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0)
      return bt - at
    })

    const unreadTotal = Object.values(unreadByJob).reduce((s, n) => s + n, 0)

    return NextResponse.json({ ok: true, threads, unreadTotal })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error', threads: [], unreadTotal: 0 }, { status: 200 })
  }
}
