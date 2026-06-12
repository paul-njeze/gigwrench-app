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
    const supabase = serviceClient()
    const contentType = req.headers.get("content-type") ?? ""
    const isJson = contentType.includes("application/json")

  let command: string
    let bookingId: string
    let proPhone: string | null = null

  try {
        if (isJson) {
                const body = await req.json() as { command: string; booking_request_id: string }
                command = body.command.toUpperCase().trim()
                bookingId = body.booking_request_id
        } else {
                const text = await req.text()
                const urlParams = new URLSearchParams(text)
                proPhone = urlParams.get("From") ?? ""
                command = (urlParams.get("Body") ?? "").toUpperCase().trim()

          const { data: recent } = await supabase
                  .from("booking_requests")
                  .select("id")
                  .eq("status", "slot_offered")
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single()

          if (!recent) {
                    return new Response("<Response></Response>", {
                                headers: { "Content-Type": "text/xml" },
                    })
          }
                bookingId = recent.id
        }

      const { data: booking, error: bErr } = await supabase
          .from("booking_requests")
          .select("*")
          .eq("id", bookingId)
          .single()

      if (bErr || !booking) {
              if (isJson) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
              return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } })
      }

      const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", booking.pro_id)
          .single()

      const proPhoneNum = proPhone ?? profile?.phone ?? ""
        const proName = profile?.full_name ?? "Your Pro"

      if (command === "BOOK") {
              await supabase
                .from("booking_requests")
                .update({ status: "booked", confirmed_at: new Date().toISOString() })
                .eq("id", bookingId)

          await supabase.from("jobs").insert({
                    pro_id: booking.pro_id,
                    status: "confirmed",
                    scheduled_at: booking.dispatch_slot_offered,
                    title: `Dispatch booking - ${booking.customer_name}`,
                    description: booking.job_description,
                    customer_id: null,
                    address: null,
                    quoted_amount: null,
                    final_amount: null,
          })

          fetch(`${BASE_URL}/api/dispatch/confirm-booking`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ booking_request_id: bookingId }),
          }).catch(() => {})

      } else if (command === "NEXT") {
              fetch(`${BASE_URL}/api/dispatch/find-slot`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                                    booking_request_id: bookingId,
                                    pro_id: booking.pro_id,
                                    estimated_duration_hours: booking.estimated_duration_hours ?? 2,
                        }),
              }).catch(() => {})

      } else if (command === "ACCEPT") {
        // Check for pending work_order_transfer for this customer's booking
        const { data: pendingTransfer } = await supabase
          .from("work_order_transfers")
          .select("id, booking_request_id, original_pro_id, receiving_pro_id")
          .eq("booking_request_id", bookingId)
          .eq("status", "pending_customer_consent")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (pendingTransfer) {
          await supabase
            .from("work_order_transfers")
            .update({ status: "customer_accepted", customer_responded_at: new Date().toISOString() })
            .eq("id", pendingTransfer.id)

          await supabase
            .from("booking_requests")
            .update({ pro_id: pendingTransfer.receiving_pro_id })
            .eq("id", pendingTransfer.booking_request_id)

          const { data: newPro } = await supabase
            .from("profiles")
            .select("phone")
            .eq("id", pendingTransfer.receiving_pro_id)
            .single()

          const { data: origPro } = await supabase
            .from("profiles")
            .select("phone")
            .eq("id", pendingTransfer.original_pro_id)
            .single()

          if (newPro?.phone) {
            await sendTwilioSMS(newPro.phone, `The customer has accepted the transfer. The work order is now yours. -- Dispatch, your GigWrench AI`)
          }
          if (origPro?.phone) {
            await sendTwilioSMS(origPro.phone, `Transfer accepted. You are released from this booking. -- Dispatch, your GigWrench AI`)
          }
        }

      } else if (command === "DECLINE") {
        // Check if there is a pending work_order_transfer for this customer first
        const { data: pendingDeclineTransfer } = await supabase
          .from("work_order_transfers")
          .select("id, booking_request_id, original_pro_id, receiving_pro_id")
          .eq("booking_request_id", bookingId)
          .eq("status", "pending_customer_consent")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (pendingDeclineTransfer) {
          await supabase
            .from("work_order_transfers")
            .update({ status: "customer_declined", customer_responded_at: new Date().toISOString() })
            .eq("id", pendingDeclineTransfer.id)

          const { data: depositHold } = await supabase
            .from("deposit_holds")
            .select("stripe_payment_intent_id")
            .eq("booking_request_id", pendingDeclineTransfer.booking_request_id)
            .eq("status", "held")
            .single()

          if (depositHold?.stripe_payment_intent_id) {
            await fetch("https://api.stripe.com/v1/refunds", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({ payment_intent: depositHold.stripe_payment_intent_id }).toString(),
            })
            await supabase.from("deposit_holds").update({ status: "refunded" }).eq("booking_request_id", pendingDeclineTransfer.booking_request_id)
          }

          await supabase.from("booking_requests").update({ status: "cancelled" }).eq("id", pendingDeclineTransfer.booking_request_id)

          await sendTwilioSMS(booking.customer_phone, `Your booking has been cancelled and a full refund is on its way. -- Dispatch, your GigWrench AI`)
        } else {
              await supabase
                .from("booking_requests")
                .update({ status: "declined" })
                .eq("id", bookingId)

          await sendTwilioSMS(
                    booking.customer_phone,
                    `We're sorry -- ${proName} is not available for your requested time. Search for other Pros at gigwrench.app. -- Dispatch, your GigWrench AI`
                  )
        }

      } else if (command === "RESCHEDULE") {
              await sendTwilioSMS(
                        proPhoneNum,
                        `Reply with your preferred date and time (example: Jun 20 at 2pm) and Dispatch will update the booking. -- Dispatch, your GigWrench AI`
                      )

      } else if (command === "CALL") {
              await sendTwilioSMS(
                        proPhoneNum,
                        `Customer contact: ${booking.customer_name} at ${booking.customer_phone}. -- Dispatch, your GigWrench AI`
                      )

      } else {
              await sendTwilioSMS(
                        proPhoneNum,
                        `Dispatch did not recognise that reply. Valid commands: BOOK, NEXT, DECLINE, RESCHEDULE, CALL. -- Dispatch, your GigWrench AI`
                      )
      }

      if (isJson) {
              return NextResponse.json({ success: true, command })
      }
        return new Response("<Response></Response>", {
                headers: { "Content-Type": "text/xml" },
        })

  } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        if (isJson) return NextResponse.json({ error: message }, { status: 500 })
        return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } })
  }
}
