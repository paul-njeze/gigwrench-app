import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function shell(headline: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:560px;">
      <tr><td style="padding-bottom:32px;"><p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#FFFFFF;">GIG<span style="color:#F5C518;">WRENCH</span></p></td></tr>
      <tr><td style="background:#131C28;border-radius:16px;padding:32px;border:1px solid #1E2D42;">
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">${headline}</p>
        ${bodyHtml}
        <p style="margin:16px 0 0;font-size:13px;color:#6B7280;line-height:1.6;">Questions? Contact support@gigwrench.app.</p>
      </td></tr>
      <tr><td style="padding-top:24px;text-align:center;"><p style="margin:0;font-size:11px;color:#374151;">GigWrench Trust and Safety.</p></td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
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
    const { data: adminRow } = await serviceClient
      .from('admin_users').select('level').eq('profile_id', user.id).maybeSingle()
    if (!adminRow) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json()) as {
      op: 'open' | 'close'
      target_id?: string
      investigation_id?: string
      reason?: string
      resolution?: 'cleared' | 'warning' | 'suspended' | 'disabled'
      suspended_until?: string | null
    }
    const nowIso = new Date().toISOString()

    async function notify(targetId: string, headline: string, bodyHtml: string, subject: string) {
      const { data: t } = await serviceClient
        .from('profiles').select('first_name,email').eq('id', targetId).single()
      if (!t?.email) return
      const name = `${t.first_name ?? ''}`.trim() || 'there'
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'support@gigwrench.app', to: t.email, subject,
            html: shell(headline, bodyHtml.replace('{name}', name)),
          }),
        })
      } catch { /* best effort */ }
    }

    if (body.op === 'open') {
      if (!body.target_id) {
        return NextResponse.json({ error: 'target_id is required' }, { status: 400 })
      }
      const { data: inv, error: insErr } = await serviceClient
        .from('investigations')
        .insert({ profile_id: body.target_id, opened_by: user.id, status: 'open', reason: body.reason ?? null })
        .select('id').single()
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
      await serviceClient.from('audit_log').insert({
        actor_id: user.id, action: 'investigation_open', target_type: 'profile',
        target_id: body.target_id, details: { investigation_id: inv?.id, reason: body.reason ?? null },
      })
      await notify(body.target_id, 'Your account is under review',
        '<p style="margin:0;font-size:14px;color:#9CA3AF;">Hi {name}, your account is currently under review by our Trust and Safety team. No action is required from you right now. We will contact you again once the review is complete.</p>',
        'Your GigWrench account is under review')
      return NextResponse.json({ success: true, investigation_id: inv?.id })
    }

    if (body.op === 'close') {
      if (!body.investigation_id || !body.target_id || !body.resolution) {
        return NextResponse.json({ error: 'investigation_id, target_id and resolution are required' }, { status: 400 })
      }
      const { error: updErr } = await serviceClient
        .from('investigations')
        .update({ status: 'closed', resolution: body.resolution, closed_by: user.id, closed_at: nowIso })
        .eq('id', body.investigation_id)
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

      // Apply the outcome to the account.
      const statusFor: Record<string, string> = {
        cleared: 'active', warning: 'warned', suspended: 'suspended', disabled: 'disabled',
      }
      const newStatus = statusFor[body.resolution]
      const untilValue = body.resolution === 'suspended' ? (body.suspended_until ?? null) : null
      await serviceClient.from('profiles').update({
        account_status: newStatus, status_reason: body.reason ?? `investigation: ${body.resolution}`,
        status_changed_at: nowIso, status_changed_by: user.id, suspended_until: untilValue,
      }).eq('id', body.target_id)

      await serviceClient.from('audit_log').insert({
        actor_id: user.id, action: 'investigation_close', target_type: 'profile',
        target_id: body.target_id,
        details: { investigation_id: body.investigation_id, resolution: body.resolution, suspended_until: untilValue },
      })

      let outcomeLine = ''
      if (body.resolution === 'cleared') outcomeLine = 'the review found no issue and your account remains active. Thank you for your patience.'
      else if (body.resolution === 'warning') outcomeLine = 'the review resulted in a formal warning on your account. Please review our terms and acceptable use.'
      else if (body.resolution === 'suspended') {
        const until = untilValue ? new Date(untilValue).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'further notice'
        outcomeLine = `the review resulted in your account being suspended until ${until}.`
      } else outcomeLine = 'the review resulted in your account being disabled. Contact support if you believe this is an error.'

      await notify(body.target_id, 'A decision has been made on your account review',
        `<p style="margin:0;font-size:14px;color:#9CA3AF;">Hi {name}, our review of your account is complete and ${outcomeLine}</p>`,
        'A decision on your GigWrench account review')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'op must be open or close' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
