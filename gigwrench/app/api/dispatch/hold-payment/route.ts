export const runtime = "edge"

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

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
            .select("full_name")
            .eq("id", booking.pro_id)
            .single()

      const proName = profile?.full_name ?? "Your Pro"
          const stripeKey = process.env.STRIPE_SECRET_KEY!
          const stripeAuth = `Bearer ${stripeKey}`

      const priceParams = new URLSearchParams({
              currency: "usd",
              unit_amount: "5000",
              "product_data[name]": "Priority Hold",
      })

      const priceRes = await fetch("https://api.stripe.com/v1/prices", {
              method: "POST",
              headers: {
                        Authorization: stripeAuth,
                        "Content-Type": "application/x-www-form-urlencoded",
              },
              body: priceParams.toString(),
      })

      if (!priceRes.ok) {
              const text = await priceRes.text()
              return NextResponse.json({ error: `Stripe price error: ${text}` }, { status: 500 })
      }

      const priceData = await priceRes.json() as { id: string }
          const priceId = priceData.id

      const linkParams = new URLSearchParams({
              "line_items[0][price]": priceId,
              "line_items[0][quantity]": "1",
      })

      const linkRes = await fetch("https://api.stripe.com/v1/payment_links", {
              method: "POST",
              headers: {
                        Authorization: stripeAuth,
                        "Content-Type": "application/x-www-form-urlencoded",
              },
              body: linkParams.toString(),
      })

      if (!linkRes.ok) {
              const text = await linkRes.text()
              return NextResponse.json({ error: `Stripe payment link error: ${text}` }, { status: 500 })
      }

      const linkData = await linkRes.json() as { url: string }
          const paymentUrl = linkData.url

      await supabase.from("deposit_holds").insert({
              booking_request_id,
              stripe_payment_link: paymentUrl,
              amount_cents: 5000,
              status: "unpaid",
      })

      if (booking.customer_phone) {
              await sendTwilioSMS(
                        booking.customer_phone,
                        `Secure your booking with ${proName} with a $50 Priority Hold: ${paymentUrl}. This guarantees your slot. -- Dispatch, your GigWrench AI`
                      )
      }

      return NextResponse.json({ success: true, payment_link: paymentUrl })
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return NextResponse.json({ error: message }, { status: 500 })
    }
}
