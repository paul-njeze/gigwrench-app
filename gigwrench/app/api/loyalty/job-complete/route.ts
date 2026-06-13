export const runtime = 'edge'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendTwilioSMS(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_PHONE_NUMBER!
  const auth = btoa(`${sid}:${token}`)
  const params = new URLSearchParams({ From: from, To: to, Body: body })
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twilio error: ${text}`)
  }
}

function getTradeCategory(title: string, description: string | null): string {
  const text = `${title} ${description || ''}`.toLowerCase()
  if (text.match(/plumb|pipe|drain|water|toilet|faucet|leak/)) return 'plumbing'
  if (text.match(/electric|wire|outlet|breaker|panel|light/)) return 'electrical'
  if (text.match(/hvac|heat|cool|ac|furnace|duct|air/)) return 'hvac'
  if (text.match(/carp|wood|door|floor|cabinet|trim|deck/)) return 'carpentry'
  if (text.match(/clean|maid|wash|scrub|sanitize/)) return 'cleaning'
  if (text.match(/paint|color|wall|ceiling|primer/)) return 'painting'
  if (text.match(/lawn|garden|tree|mow|landscape|yard/)) return 'landscaping'
  if (text.match(/lock|security|alarm|camera|safe/)) return 'security'
  return 'plumbing'
}

function buildCompletionEmail(
  customerName: string,
  proName: string,
  jobTitle: string,
  jobAmount: number | null,
  proId: string,
  tips: Array<{ title: string; body: string }>,
  category: string
): string {
  const tipRows = tips.slice(0, 3).map(tip => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #1E2D42;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#F9FAFB;">${tip.title}</p>
        <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.6;">${tip.body}</p>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:560px;">
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#FFFFFF;">GIG<span style="color:#F5C518;">WRENCH</span></p>
        </td></tr>
        <tr><td style="background:#131C28;border-radius:16px;padding:32px;border:1px solid #1E2D42;">
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#F9FAFB;">Job Complete</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">Hi ${customerName}, your job has been completed.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;border-radius:10px;padding:16px;margin-bottom:24px;">
            <tr>
              <td style="font-size:12px;color:#6B7280;padding-bottom:4px;">JOB</td>
              <td style="font-size:14px;color:#F9FAFB;font-weight:600;text-align:right;">${jobTitle}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#6B7280;padding-top:8px;">PRO</td>
              <td style="font-size:14px;color:#F9FAFB;font-weight:600;text-align:right;padding-top:8px;">${proName}</td>
            </tr>
            ${jobAmount ? `<tr>
              <td style="font-size:12px;color:#6B7280;padding-top:8px;">AMOUNT</td>
              <td style="font-size:14px;color:#10B981;font-weight:700;text-align:right;padding-top:8px;">$${jobAmount.toFixed(2)}</td>
            </tr>` : ''}
          </table>
          <a href="https://gigwrench-app.vercel.app/book/${proId}" style="display:block;background:#F5C518;color:#000000;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:32px;">Book ${proName} Again</a>
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:2px;">${category} tips for your home</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${tipRows}
          </table>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#374151;">GigWrench -- The field service OS for pros and the people they serve.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { job_id } = await req.json() as { job_id: string }
    const supabase = serviceClient()

    const { data: job, error: jErr } = await supabase
      .from('jobs')
      .select('id,title,description,customer_id,pro_id:profiles!jobs_pro_id_fkey(id,first_name,last_name,phone),final_amount,quoted_amount')
      .eq('id', job_id)
      .single()

    if (jErr || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    await supabase
      .from('jobs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', job_id)

    const pro = job.pro_id as unknown as { id: string; first_name: string; last_name: string; phone: string }
    const proName = `${pro.first_name} ${pro.last_name}`
    const amount = job.final_amount || job.quoted_amount

    const { data: customer } = await supabase
      .from('customers')
      .select('name,phone,email')
      .eq('id', job.customer_id)
      .single()

    const category = getTradeCategory(job.title, job.description)

    const tipsModule = await fetch('https://raw.githubusercontent.com/paul-njeze/gigwrench-app/main/gigwrench/lib/loyalty/tips.json')
    const tipsData = await tipsModule.json()
    const categoryTips = tipsData.categories[category]?.tips || []
    const shuffled = categoryTips.sort(() => Math.random() - 0.5)

    const results: string[] = []

    // SMS
    if (customer?.phone) {
      try {
        const smsBody = `GigWrench: Your ${job.title} job is complete! Thanks for choosing ${proName}. Need help again? Book at: gigwrench-app.vercel.app/book/${pro.id}`
        await sendTwilioSMS(customer.phone, smsBody)
        await supabase.from('loyalty_events').insert({
          job_id,
          customer_id: job.customer_id,
          pro_id: pro.id,
          event_type: 'job_complete_sms',
          status: 'sent',
        })
        results.push('sms_sent')
      } catch {
        await supabase.from('loyalty_events').insert({
          job_id,
          customer_id: job.customer_id,
          pro_id: pro.id,
          event_type: 'job_complete_sms',
          status: 'failed',
        })
        results.push('sms_failed')
      }
    }

    // Email
    if (customer?.email) {
      try {
        const emailHtml = buildCompletionEmail(
          customer.name,
          proName,
          job.title,
          amount,
          pro.id,
          shuffled,
          category
        )
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'dispatch@gigwrench.app',
            to: customer.email,
            subject: `Your ${job.title} job is complete -- GigWrench`,
            html: emailHtml,
          }),
        })
        await supabase.from('loyalty_events').insert({
          job_id,
          customer_id: job.customer_id,
          pro_id: pro.id,
          event_type: 'job_complete_email',
          status: 'sent',
        })
        results.push('email_sent')
      } catch {
        await supabase.from('loyalty_events').insert({
          job_id,
          customer_id: job.customer_id,
          pro_id: pro.id,
          event_type: 'job_complete_email',
          status: 'failed',
        })
        results.push('email_failed')
      }
    }

    // In-app notification via Supabase
    await supabase.from('loyalty_events').insert({
      job_id,
      customer_id: job.customer_id,
      pro_id: pro.id,
      event_type: 'job_complete_inapp',
      status: 'sent',
      metadata: {
        message: `Your ${job.title} job is complete. ${proName} did a great job -- book again anytime.`,
        pro_id: pro.id,
        pro_name: proName,
        book_url: `/book/${pro.id}`,
      },
    })
    results.push('inapp_sent')

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
