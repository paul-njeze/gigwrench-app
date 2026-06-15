import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const WHATSAPP_TO = 'whatsapp:+17037551234' // placeholder -- replace with real number in Vercel

export async function POST(req: NextRequest) {
  try {
    const { userName, userEmail, summary, transcript } = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886' // Twilio sandbox default

    const toNumber = process.env.FOUNDER_WHATSAPP || WHATSAPP_TO

    const body = [
      '🔔 *GigWrench Support Escalation*',
      '',
      `*From:* ${userName || 'Anonymous'}`,
      userEmail ? `*Email:* ${userEmail}` : '',
      `*Issue:* ${summary}`,
      '',
      '*Chat transcript:*',
      transcript || '(no transcript)',
    ].filter(Boolean).join('\n')

    const params = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: body,
    })

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    )

    if (!twilioResponse.ok) {
      const err = await twilioResponse.text()
      console.error('Twilio WhatsApp error:', err)
      // Still return success to user -- we do not want them to know WhatsApp failed
    }

    // Send confirmation email to user via Resend if they provided email
    if (userEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'GigWrench Support <support@gigwrench.app>',
            to: userEmail,
            subject: 'We received your message -- GigWrench Support',
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
                <div style="background: #07090D; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                  <span style="color: #F5C518; font-size: 20px; font-weight: 700; letter-spacing: 4px;">GIG<span style="color: white;">WRENCH</span></span>
                </div>
                <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 16px; margin: 0 0 16px;">Hi ${userName || 'there'},</p>
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">Thanks for reaching out. We have received your message and our team will follow up with you within a few hours.</p>
                  <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">In the meantime, you can explore GigWrench at <a href="https://app.gigwrench.app" style="color: #F5C518;">app.gigwrench.app</a>.</p>
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">The GigWrench Support Team<br/>support@gigwrench.app</p>
                </div>
              </div>
            `,
          }),
        })
      } catch {
        // Email failure never blocks the escalation
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
