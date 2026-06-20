export const runtime = "edge"

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { dispatch } from "@/lib/notify"

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function formatSlot(iso: string): string {
  const d = new Date(iso)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const day = days[d.getUTCDay()]
  const month = months[d.getUTCMonth()]
  const date = d.getUTCDate()
  let hours = d.getUTCHours()
  const minutes = d.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${day} ${month} ${date} at ${hours}:${minutes} ${ampm}`
}

export async function POST(req: NextRequest) {
  try {
    const { booking_request_id } = await req.json() as { booking_request_id: string }
    const supabase = serviceClient()

    const { data: booking, error: bErr } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("id", booking_request_id)
      .single()

    if (bErr || !booking) {
      return NextResponse.json({ error: "Booking request not found" }, { status: 404 })
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", booking.pro_id)
      .single()

    if (pErr || !profile) {
      return NextResponse.json({ error: "Pro profile not found" }, { status: 404 })
    }

    const slotFormatted = booking.dispatch_slot_offered
      ? formatSlot(booking.dispatch_slot_offered)
      : "TBD"

    const smsBody = `Dispatch: New job request from ${booking.customer_name}: ${booking.job_description} (~${booking.estimated_duration_hours}h). Reply BOOK to confirm ${slotFormatted}, NEXT for next available slot, or DECLINE. From Dispatch, your GigWrench AI`

    // Routed through the notification spine: the SMS_ENABLED dark gate applies and
    // the attempt is recorded in the ledger. While SMS is dark this returns a
    // skipped result instead of failing, so the Dispatch flow is not blocked.
    const result = await dispatch({
      recipientId: booking.pro_id,
      to: { phone: profile.phone },
      type: "dispatch_job_request",
      sms: { body: smsBody },
    })

    await supabase
      .from("booking_requests")
      .update({ dispatch_sent_at: new Date().toISOString() })
      .eq("id", booking_request_id)

    return NextResponse.json({ success: true, fired: result.fired })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
