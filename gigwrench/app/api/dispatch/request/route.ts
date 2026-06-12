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

export async function POST(req: NextRequest) {
    try {
          const body = await req.json() as {
                  pro_id: string
                  customer_name: string
                  customer_email: string
                  customer_phone?: string
                  job_description: string
                  preferred_date?: string
                  estimated_duration_hours?: number
                  sms_consent?: boolean
                  sms_consent_timestamp?: string
          }

      const { pro_id, customer_name, customer_email, job_description } = body

      if (!pro_id || !customer_name || !customer_email || !job_description) {
              return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const supabase = serviceClient()

      const { data: newRow, error } = await supabase
            .from("booking_requests")
            .insert({
                      pro_id,
                      customer_name,
                      customer_email,
                      customer_phone: body.customer_phone ?? null,
                      job_description,
                      preferred_date: body.preferred_date ?? null,
                      estimated_duration_hours: body.estimated_duration_hours ?? 2,
                      status: "pending",
                      sms_consent: body.sms_consent ?? false,
                      sms_consent_timestamp: body.sms_consent_timestamp ?? null,
            })
            .select("id")
            .single()

      if (error || !newRow) {
              return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 })
      }

      fetch(`${BASE_URL}/api/dispatch/find-slot`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                        booking_request_id: newRow.id,
                        pro_id,
                        estimated_duration_hours: body.estimated_duration_hours ?? 2,
              }),
      }).catch(() => {})

      return NextResponse.json({ success: true, booking_request_id: newRow.id }, { status: 200 })
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return NextResponse.json({ error: message }, { status: 500 })
    }
}
