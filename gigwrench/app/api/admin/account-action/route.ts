import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatch } from '@/lib/notify'
import { renderEmail, escapeHtml, FOOTER_TRUST_SAFETY } from '@/lib/notify/shell'

export const runtime = 'edge'

type Action = 'warn' | 'suspend' | 'disable' | 'restore'

const STATUS_FOR: Record<Action, string> = {
  warn: 'warned',
  suspend: 'suspended',
  disable: 'disabled',
  restore: 'active',
}

function buildStatusEmail(
  name: string,
  action: Action,
  reason: string,
  suspendedUntil: string | null
): { subject: string; html: string } {
  let headline = ''
  let body = ''
  if (action === 'warn') {
    headline = 'A warning has been issued on your account'
    body = 'Your account has received a formal warning. Please review our terms and acceptable use to avoid further action.'
  } else if (action === 'suspend') {
    const until = suspendedUntil
      ? new Date(suspendedUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'further notice'
    headline = 'Your account has been suspended'
    body = `Your account is suspended until ${until}. During this time you will not be able to sign in.`
  } else if (action === 'disable') {
    headline = 'Your account has been disabled'
    body = 'Your account has been disabled and you will no longer be able to sign in. Contact support if you believe this is an error.'
  } else {
    headline = 'Your account has been restored'
    body = 'Your account is active again and you can sign in as normal. Thank you.'
  }
  const safeName = escapeHtml(name)
  const reasonLine = reason
    ? `<p style="margin:0 0 16px;font-size:13px;color:#9CA3AF;">Reason: ${escapeHtml(reason)}</p>`
    : ''
  const cardHtml = `<p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">${headline}</p>
        <p style="margin:0 0 16px;font-size:14px;color:#9CA3AF;">Hi ${safeName}, ${body}</p>
        ${reasonLine}
        <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">If you have questions, reply to this message or contact support@gigwrench.app.</p>`
  const html = renderEmail({ cardHtml, footer: FOOTER_TRUST_SAFETY })
  const subject =
    action === 'restore' ? 'Your GigWrench account has been restored'
    : action === 'warn' ? 'A warning on your GigWrench account'
    : action === 'suspend' ? 'Your GigWrench account has been suspended'
    : 'Your GigWrench account has been disabled'
  return { subject, html }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const accessToken = authHeader.replace('Bearer ', '')

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )
    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Server-side admin check: this is the real security boundary, not the UI.
    const { data: adminRow } = await serviceClient
      .from('admin_users')
      .select('level')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (!adminRow) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { target_id, action, reason, suspended_until } = (await req.json()) as {
      target_id: string
      action: Action
      reason?: string
      suspended_until?: string | null
    }
    if (!target_id || !(action in STATUS_FOR)) {
      return NextResponse.json({ error: 'target_id and a valid action are required' }, { status: 400 })
    }
    if (target_id === user.id) {
      return NextResponse.json({ error: 'You cannot action your own account' }, { status: 400 })
    }

    // Least privilege: a support-level admin cannot disable accounts.
    if (action === 'disable' && adminRow.level === 'support') {
      return NextResponse.json({ error: 'Disabling an account requires a senior admin' }, { status: 403 })
    }

    const nowIso = new Date().toISOString()
    const newStatus = STATUS_FOR[action]
    const untilValue = action === 'suspend' ? (suspended_until ?? null) : null

    const { error: updErr } = await serviceClient
      .from('profiles')
      .update({
        account_status: newStatus,
        status_reason: reason ?? null,
        status_changed_at: nowIso,
        status_changed_by: user.id,
        suspended_until: untilValue,
      })
      .eq('id', target_id)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    await serviceClient.from('audit_log').insert({
      actor_id: user.id,
      action: `account_${action}`,
      target_type: 'profile',
      target_id,
      details: { reason: reason ?? null, suspended_until: untilValue },
    })

    // Account-status notices are account-critical, so they send regardless of
    // marketing preferences. SMS stays dark until SMS_ENABLED.
    const { data: target } = await serviceClient
      .from('profiles')
      .select('first_name,last_name,email')
      .eq('id', target_id)
      .single()

    let emailed = false
    if (target?.email) {
      const name = `${target.first_name ?? ''}`.trim() || 'there'
      const { subject, html } = buildStatusEmail(name, action, reason ?? '', untilValue)
      const result = await dispatch({
        recipientId: target_id,
        to: { email: target.email },
        type: `account_${action}`,
        critical: true,
        email: { from: 'support@gigwrench.app', subject, html },
      })
      emailed = result.results.some(
        (r) => r.channel === 'email' && r.status === 'sent'
      )
    }

    return NextResponse.json({ success: true, status: newStatus, emailed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
