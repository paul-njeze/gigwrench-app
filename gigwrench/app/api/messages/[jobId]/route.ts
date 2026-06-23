import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// In-app chat for a single job. The two parties are the assigned Pro
// (jobs.pro_id, which equals their profiles id) and the customer
// (jobs.customer_id, which equals their profiles id). All cross-party
// reads and all writes run through the service-role client behind a strict
// party check, so neither side can reach the other's profile or any other
// job's messages directly. Profiles are always fetched separately by id;
// we never embed profiles on jobs.pro_id.

const LANG_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', pt: 'Portuguese', fr: 'French', ar: 'Arabic',
  zh: 'Chinese (Simplified)', hi: 'Hindi', ko: 'Korean', tr: 'Turkish',
  de: 'German', it: 'Italian', nl: 'Dutch', ro: 'Romanian', sv: 'Swedish',
}

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  language: string | null
  role: 'pro' | 'customer'
}

type MessageRow = {
  id: string
  sender_id: string | null
  recipient_id: string | null
  original_text: string
  original_language: string
  translated_text: string | null
  translated_language: string | null
  read_at: string | null
  created_at: string
  message_type: string
}

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

// Translate text into the recipient's language. Returns null when the
// languages match, when translation is not needed, or on any failure, so a
// send is never blocked by the translation step.
async function translate(text: string, srcCode: string, tgtCode: string): Promise<string | null> {
  if (!text || srcCode === tgtCode) return null
  const src = LANG_NAMES[srcCode] || srcCode
  const tgt = LANG_NAMES[tgtCode] || tgtCode
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: `You are a translation engine for a chat between a service professional and their customer. Translate the user's message from ${src} to ${tgt}. Output only the translated text, with no preamble, no quotes, and no notes. Preserve meaning, tone, names, numbers, addresses, and links exactly. Keep it natural and plain.`,
        messages: [{ role: 'user', content: text.slice(0, 4000) }],
      }),
    })
    if (!r.ok) return null
    const data = await r.json()
    const out = (data.content?.[0]?.text || '').trim()
    return out || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  try {
    const userId = await resolveUserId(req)
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const svc = svcClient()
    const { data: jobRaw } = await svc.from('jobs').select('id,title,status,pro_id,customer_id').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { id: string; title: string | null; status: string; pro_id: string | null; customer_id: string | null } | null
    if (!job) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

    const isPro = job.pro_id === userId
    const isCustomer = job.customer_id === userId
    if (!isPro && !isCustomer) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const counterpartyId = isPro ? job.customer_id : job.pro_id

    async function profile(id: string | null): Promise<ProfileRow | null> {
      if (!id) return null
      const { data } = await svc.from('profiles').select('id,first_name,last_name,avatar_url,language,role').eq('id', id).maybeSingle()
      return data as unknown as ProfileRow | null
    }

    const me = await profile(userId)
    const counterparty = await profile(counterpartyId)

    const { data: msgsRaw } = await svc
      .from('messages')
      .select('id,sender_id,recipient_id,original_text,original_language,translated_text,translated_language,read_at,created_at,message_type')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })
      .limit(300)
    const messages = (msgsRaw || []) as unknown as MessageRow[]

    // Clear unread state for anything addressed to the caller.
    await svc.from('messages').update({ read_at: new Date().toISOString() }).eq('job_id', jobId).eq('recipient_id', userId).is('read_at', null)

    return NextResponse.json({
      ok: true,
      job: { id: job.id, title: job.title, status: job.status },
      me: {
        id: userId,
        firstName: me?.first_name || '',
        language: me?.language || 'en',
        role: me?.role || (isPro ? 'pro' : 'customer'),
      },
      counterparty: counterparty
        ? {
            id: counterparty.id,
            firstName: counterparty.first_name || '',
            lastName: counterparty.last_name || '',
            avatarUrl: counterparty.avatar_url || null,
            language: counterparty.language || 'en',
            role: counterparty.role,
          }
        : null,
      messages,
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 200 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  try {
    const userId = await resolveUserId(req)
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const raw = typeof body.text === 'string' ? body.text.trim() : ''
    if (!raw) return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 })
    const text = raw.slice(0, 4000)

    const svc = svcClient()
    const { data: jobRaw } = await svc.from('jobs').select('id,pro_id,customer_id').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { id: string; pro_id: string | null; customer_id: string | null } | null
    if (!job) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

    const isPro = job.pro_id === userId
    const isCustomer = job.customer_id === userId
    if (!isPro && !isCustomer) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const recipientId = isPro ? job.customer_id : job.pro_id
    if (!recipientId) return NextResponse.json({ ok: false, error: 'no_recipient' }, { status: 400 })

    async function languageOf(id: string): Promise<string> {
      const { data } = await svc.from('profiles').select('language').eq('id', id).maybeSingle()
      return (data as unknown as { language: string | null } | null)?.language || 'en'
    }

    const srcLang = await languageOf(userId)
    const tgtLang = await languageOf(recipientId)
    const translated = await translate(text, srcLang, tgtLang)

    const insertRow = {
      job_id: jobId,
      sender_id: userId,
      recipient_id: recipientId,
      original_text: text,
      original_language: srcLang,
      translated_text: translated,
      translated_language: translated ? tgtLang : null,
      message_type: 'text',
    }

    const { data: insRaw, error } = await svc
      .from('messages')
      .insert(insertRow)
      .select('id,sender_id,recipient_id,original_text,original_language,translated_text,translated_language,read_at,created_at,message_type')
      .maybeSingle()

    if (error || !insRaw) return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 200 })

    const message = insRaw as unknown as MessageRow
    return NextResponse.json({ ok: true, message })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 200 })
  }
}
