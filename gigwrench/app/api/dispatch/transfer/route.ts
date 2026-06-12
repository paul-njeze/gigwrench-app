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
  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  )
}

async function sendResendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Dispatch <dispatch@gigwrench.app>',
      to: [to],
      subject,
      html,
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      booking_request_id: string
      receiving_pro_id: string
      transfer_reason?: string
    }

    const { booking_request_id, receiving_pro_id, transfer_reason } = body

    if (!booking_request_id || !receiving_pro_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = serviceClient()

    // Verify caller is original pro for this booking
    const userClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch booking to confirm ownership and get customer details
    const { data: booking, error: bookingError } = await supabase
      .from('booking_requests')
      .select('id, pro_id, customer_name, customer_email, customer_phone, job_description')
      .eq('id', booking_request_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.pro_id !== user.id) {
      return NextResponse.json({ error: 'You are not the original Pro for this booking' }, { status: 403 })
    }

    // Validate receiving pro exists and is verified
    const { data: receivingPro, error: proError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, is_verified')
      .eq('id', receiving_pro_id)
      .single()

    if (proError || !receivingPro) {
      return NextResponse.json({ error: 'Receiving Pro not found' }, { status: 404 })
    }

    if (!receivingPro.is_verified) {
      return NextResponse.json({ error: 'Receiving Pro is not verified' }, { status: 400 })
    }

    // Insert work_order_transfers record
    const consentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: transferError } = await supabase
      .from('work_order_transfers')
      .insert({
        booking_request_id,
        original_pro_id: user.id,
        receiving_pro_id,
        transfer_reason: transfer_reason ?? null,
        status: 'pending_customer_consent',
        customer_notified_at: new Date().toISOString(),
        consent_deadline: consentDeadline,
      })

    if (transferError) {
      return NextResponse.json({ error: transferError.message }, { status: 500 })
    }

    // Send customer SMS via Twilio
    if (booking.customer_phone) {
      await sendTwilioSMS(
        booking.customer_phone,
        `Your booking has been transferred to a new Pro. Reply ACCEPT to confirm or DECLINE for a full refund within 24 hours. -- Dispatch, your GigWrench AI`
      )
    }

    // Send customer email via Resend
    if (booking.customer_email) {
      await sendResendEmail(
        booking.customer_email,
        'Your GigWrench booking has been transferred',
        `<p>Hi ${booking.customer_name ?? 'there'},</p>
<p>Your booking has been transferred to a new Pro: <strong>${receivingPro.full_name}</strong>.</p>
<p>Reply ACCEPT to confirm or DECLINE within 24 hours for a full refund.</p>
<p>If you have questions, contact us at support@gigwrench.app.</p>
<p>-- Dispatch, your GigWrench AI</p>`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
