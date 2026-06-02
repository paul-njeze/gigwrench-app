export const runtime = "edge"

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function serviceClient() {
    return createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
}

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

function formatSlot(iso: string): string {
    const d = new Date(iso)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const day = days[d.getUTCDay()]
    const month = months[d.getUTCMonth()]
    const date = d.getUTCDate()
    let hours = d.getUTCHours()
    const minutes = d.getUTCMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12 || 12
    return `${day}, ${month} ${date} at ${hours}:${minutes} ${ampm}`
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
              method: "POST",
              headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
      }
        )
    if (!res.ok) {
          const text = await res.text()
          throw new Error(`Twilio error: ${text}`)
    }
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
              return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", booking.pro_id)
            .single()

      const proName = profile?.full_name ?? "Your Pro"
          const slotFormatted = booking.dispatch_slot_offered
            ? formatSlot(booking.dispatch_slot_offered)
                  : "TBD"

      if (booking.customer_phone) {
              await sendTwilioSMS(
                        booking.customer_phone,
                        `Your booking with ${proName} is confirmed for ${slotFormatted}. Please check your email for full details and your Priority Hold payment link. -- Dispatch, your GigWrench AI`
                      )
      }

      try {
              const emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#F5C518;font-size:28px;margin-bottom:8px">Booking Confirmed</h1><p style="color:#7A8CA0;font-size:14px;margin-bottom:24px">GigWrench Dispatch</p><table style="width:100%;border-collapse:collapse;margin-bottom:24px"><tr><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#7A8CA0;font-size:13px">Pro</td><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#ECF0F6;font-size:13px">${proName}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#7A8CA0;font-size:13px">Date and Time</td><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#ECF0F6;font-size:13px">${slotFormatted}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#7A8CA0;font-size:13px">Job</td><td style="padding:10px 0;border-bottom:1px solid #1A2535;color:#ECF0F6;font-size:13px">${booking.job_description}</td></tr></table><div style="background:#131C28;border:1px solid #1A2535;border-radius:8px;padding:16px;margin-bottom:24px"><h3 style="color:#F5C518;font-size:14px;margin-bottom:8px">Cancellation Policy</h3><p style="color:#7A8CA0;font-size:13px;margin:0">Cancel 12 or more hours before your appointment for a 50% refund. Cancellations under 12 hours are non-refundable.</p></div><p style="color:#7A8CA0;font-size:13px">A Priority Hold payment link ($50) will arrive in a separate SMS message. This secures your appointment slot.</p><hr style="border:none;border-top:1px solid #1A2535;margin:24px 0"/><p style="color:#2E3D52;font-size:11px">Dispatch by GigWrench -- gigwrench.app</p></div>`

            await fetch("https://api.resend.com/emails", {
                      method: "POST",
                      headers: {
                                  Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                                  "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                                  from: "dispatch@gigwrench.app",
                                  to: booking.customer_email,
                                  subject: "Your GigWrench booking is confirmed",
                                  html: emailHtml,
                      }),
            })
      } catch {
              // Email failure does not block the rest of the flow
      }

      fetch(`${BASE_URL}/api/dispatch/hold-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ booking_request_id }),
      }).catch(() => {})

      return NextResponse.json({ success: true })
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return NextResponse.json({ error: message }, { status: 500 })
    }
}
