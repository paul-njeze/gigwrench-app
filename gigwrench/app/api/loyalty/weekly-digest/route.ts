export const runtime = 'edge'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

function buildDigestEmail(
  customerName: string,
  tips: Array<{ category: string; title: string; body: string }>,
  country: string
): string {
  const tipRows = tips.map(tip => `
    <tr>
      <td style="padding:20px 0;border-bottom:1px solid #1E2D42;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#F5C518;text-transform:uppercase;letter-spacing:2px;">${tip.category}</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#F9FAFB;">${tip.title}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#9CA3AF;line-height:1.7;">${tip.body}</p>
        <p style="margin:0;font-size:12px;color:#6B7280;font-style:italic;">Not comfortable doing this yourself? Your Pro is one tap away.</p>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:560px;">
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#FFFFFF;">GIG<span style="color:#F5C518;">WRENCH</span></p>
          <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Your weekly home maintenance digest</p>
        </td></tr>
        <tr><td style="background:#131C28;border-radius:16px;padding:32px;border:1px solid #1E2D42;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">This week in your home</p>
          <p style="margin:0 0 28px;font-size:14px;color:#6B7280;">Hi ${customerName}, here are this week's top home maintenance tips for ${country} homeowners.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${tipRows}
          </table>
          <div style="margin-top:28px;background:#0B0F17;border-radius:10px;padding:20px;text-align:center;">
            <p style="margin:0 0 12px;font-size:14px;color:#F9FAFB;">Have a job in mind?</p>
            <a href="https://gigwrench-app.vercel.app" style="display:inline-block;background:#F5C518;color:#000000;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Find your Pro</a>
          </div>
        </td></tr>
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#374151;">GigWrench weekly digest. <a href="#" style="color:#6B7280;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = serviceClient()

    const { data: customers, error } = await supabase
      .from('profiles')
      .select('id,first_name,email,country,language')
      .eq('role', 'customer')
      .eq('weekly_digest_opt_in', true)
      .not('email', 'is', null)

    if (error || !customers) {
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    const tipsRes = await fetch('https://raw.githubusercontent.com/paul-njeze/gigwrench-app/main/gigwrench/lib/loyalty/tips.json')
    const tipsData = await tipsRes.json()
    const weekNum = getWeekNumber()

    let sent = 0
    let failed = 0

    for (const customer of customers) {
      try {
        const countryCode = customer.country || 'DEFAULT'
        const top10 = tipsData.country_top10[countryCode] || tipsData.country_top10['DEFAULT']
        const uniqueCategories = [...new Set(top10 as string[])].slice(0, 5)

        const tips = uniqueCategories.map((cat: string) => {
          const categoryData = tipsData.categories[cat]
          const tipIndex = weekNum % categoryData.tips.length
          return {
            category: categoryData.label,
            title: categoryData.tips[tipIndex].title,
            body: categoryData.tips[tipIndex].body,
          }
        })

        const countryLabel = countryCode === 'US' ? 'US' : countryCode === 'GB' ? 'UK' : countryCode

        const emailHtml = buildDigestEmail(customer.first_name, tips, countryLabel)

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'digest@gigwrench.app',
            to: customer.email,
            subject: 'Your weekly home maintenance digest -- GigWrench',
            html: emailHtml,
          }),
        })

        await supabase.from('loyalty_events').insert({
          customer_id: customer.id,
          event_type: 'weekly_digest_email',
          status: 'sent',
          metadata: { week: weekNum, country: countryCode, categories: uniqueCategories },
        })

        sent++
      } catch {
        failed++
      }
    }

    return NextResponse.json({ success: true, sent, failed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
