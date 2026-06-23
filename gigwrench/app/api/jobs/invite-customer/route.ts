import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatch } from '@/lib/notify'
import { renderEmail, emailButton, escapeHtml } from '@/lib/notify/shell'

export const runtime = 'edge'

// Sends a customer an invite to create an account for a specific job. The
// invite is recorded in job_customer_invites and accepted later by email match
// in the auth callback, which stamps jobs.customer_id so chat and the live
// tracker resolve. Only the Pro who owns the job may invite for it.

const APP_BASE = 'https://app.gigwrench.app'
const FROM = 'GigWrench Dispatch <dispatch@gigwrench.app>'

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

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function makeToken(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '')
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const jobId = typeof body.jobId === 'string' ? body.jobId : ''
    const email = (typeof body.email === 'string' ? body.email : '').trim()
    if (!jobId || !validEmail(email)) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
    }

    const svc = svcClient()

    const { data: jobRaw } = await svc.from('jobs').select('id,pro_id,title').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { id: string; pro_id: string | null; title: string | null } | null
    if (!job) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    if (job.pro_id !== userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const { data: proRaw } = await svc.from('profiles').select('first_name').eq('id', userId).maybeSingle()
    const proName = ((proRaw as unknown as { first_name: string | null } | null)?.first_name || 'Your Pro').trim() || 'Your Pro'
    const jobTitle = job.title || 'a job'

    const token = makeToken()
    const { error: insErr } = await svc.from('job_customer_invites').insert({
      token,
      job_id: jobId,
      pro_id: userId,
      customer_email: email,
    })
    if (insErr) return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 200 })

    const signupUrl = `${APP_BASE}/signup?role=customer`
    const safePro = escapeHtml(proName)
    const safeJob = escapeHtml(jobTitle)
    const card = `
      <p style="margin:0 0 16px;font-size:16px;color:#FFFFFF;font-weight:600;">${safePro} invited you to GigWrench</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9CA3AF;">Create a free account to message ${safePro} and follow your job, ${safeJob}, with live arrival tracking.</p>
      ${emailButton('Create your account', signupUrl)}
      <p style="margin:0;font-size:12px;color:#6B7280;">Use this email address when you sign up so your job links automatically. This invite expires in 14 days.</p>`

    await dispatch({
      to: { email },
      type: 'customer_invite',
      critical: true,
      email: {
        from: FROM,
        subject: `${proName} invited you to track your job`,
        html: renderEmail({ cardHtml: card }),
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 200 })
  }
}
