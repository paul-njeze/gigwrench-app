export const runtime = 'edge'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      booking_request_id: string
      selected_slot: string
      terms_accepted: boolean
      customer_ip: string
      conversation_summary: string
      attachment_ids: string[]
    }

    const {
      booking_request_id,
      selected_slot,
      terms_accepted,
      customer_ip,
      conversation_summary,
      attachment_ids,
    } = body

    if (!terms_accepted) {
      return NextResponse.json({ error: 'Terms must be accepted' }, { status: 400 })
    }

    if (!booking_request_id || !selected_slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = serviceClient()

    // Fetch booking to get customer email
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('customer_email')
      .eq('id', booking_request_id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: fetchError?.message ?? 'Booking not found' }, { status: 404 })
    }

    // Update booking_requests with slot and status
    const { error: updateError } = await supabase
      .from('booking_requests')
      .update({
        dispatch_slot_offered: selected_slot,
        status: 'slot_offered',
      })
      .eq('id', booking_request_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Insert terms acceptance record
    const { error: termsError } = await supabase
      .from('terms_acceptances')
      .insert({
        booking_request_id,
        customer_email: booking.customer_email,
        customer_ip: customer_ip ?? null,
        terms_version: 'v1.0',
        acceptance_method: 'checkbox',
      })

    if (termsError) {
      return NextResponse.json({ error: termsError.message }, { status: 500 })
    }

    // Trigger confirm-booking route (Pro SMS, customer confirmation, deposit link)
    fetch(`${BASE_URL}/api/dispatch/confirm-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_request_id }),
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
