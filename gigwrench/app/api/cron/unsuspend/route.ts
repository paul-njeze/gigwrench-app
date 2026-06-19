import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function buildRestoredEmail(name: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="100%" style="max-width:560px;">
      <tr><td style="padding-bottom:32px;"><p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#FFFFFF;">GIG<span style="color:#F5C518;">WRENCH</span></p></td></tr>
      <tr><td style="background:#131C28;border-radius:16px;padding:32px;border:1px solid #1E2D42;">
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">Your account has been restored</p>
        <p style="margin:0;font-size:14px;color:#9CA3AF;">Hi ${name}, your suspension period has ended and your account is active again. You can sign in as normal. Thank you.</p>
      </td></tr>
      <tr><td style="padding-top:24px;text-align:center;"><p style="margin:0;font-size:11px;color:#374151;">GigWrench Trust and Safety.</p></td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer ${CRON_SECRET} when CRON_SECRET is set.
  const auth = req.headers.get('Authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const nowIso = new Date().toISOString()
  const { data: expired, error } = await serviceClient
    .from('profiles')
    .select('id,first_name,email')
    .eq('account_status', 'suspended')
    .not('suspended_until', 'is', null)
    .lte('suspended_until', nowIso)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let restored = 0
  for (const row of expired ?? []) {
    const { error: updErr } = await serviceClient
      .from('profiles')
      .update({
        account_status: 'active',
        suspended_until: null,
        status_reason: 'auto: suspension period ended',
        status_changed_at: nowIso,
      })
      .eq('id', row.id)
    if (updErr) continue
    restored += 1

    await serviceClient.from('audit_log').insert({
      actor_id: null,
      action: 'account_auto_restore',
      target_type: 'profile',
      target_id: row.id,
      details: { trigger: 'cron', expired_at: nowIso },
    })

    if (row.email) {
      try {
        const name = `${row.first_name ?? ''}`.trim() || 'there'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'support@gigwrench.app',
            to: row.email,
            subject: 'Your GigWrench account has been restored',
            html: buildRestoredEmail(name),
          }),
        })
      } catch {
        // best effort; the account is restored regardless of email delivery
      }
    }
  }

  return NextResponse.json({ success: true, restored })
}
