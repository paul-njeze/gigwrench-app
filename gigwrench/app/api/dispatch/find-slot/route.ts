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

function isWeekend(d: Date): boolean {
    const day = d.getUTCDay()
    return day === 0 || day === 6
}

export async function POST(req: NextRequest) {
    try {
          const { booking_request_id, pro_id, estimated_duration_hours } = await req.json() as {
                  booking_request_id: string
                  pro_id: string
                  estimated_duration_hours: number
          }

      const duration = estimated_duration_hours || 2
          const supabase = serviceClient()

      const now = new Date()
          const windowEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      const { data: existingJobs } = await supabase
            .from("jobs")
            .select("scheduled_at")
            .eq("pro_id", pro_id)
            .gte("scheduled_at", now.toISOString())
            .lte("scheduled_at", windowEnd.toISOString())
            .not("status", "eq", "cancelled")

      const bookedSlots = (existingJobs || []).map((j: { scheduled_at: string }) => ({
              start: new Date(j.scheduled_at).getTime(),
              end: new Date(j.scheduled_at).getTime() + 2 * 60 * 60 * 1000,
      }))

      const slotDurationMs = duration * 60 * 60 * 1000

      let candidate = new Date(now)
          candidate.setUTCDate(candidate.getUTCDate() + 1)
          candidate.setUTCHours(8, 0, 0, 0)

      let foundSlot: Date | null = null

      for (let attempt = 0; attempt < 30 && !foundSlot; attempt++) {
              if (isWeekend(candidate)) {
                        candidate.setUTCDate(candidate.getUTCDate() + 1)
                        candidate.setUTCHours(8, 0, 0, 0)
                        continue
              }

            const slotStart = candidate.getTime()
              const slotEnd = slotStart + slotDurationMs

            const endOfWorkday = new Date(candidate)
              endOfWorkday.setUTCHours(18, 0, 0, 0)

            if (slotEnd > endOfWorkday.getTime()) {
                      candidate.setUTCDate(candidate.getUTCDate() + 1)
                      candidate.setUTCHours(8, 0, 0, 0)
                      continue
            }

            const conflicts = bookedSlots.filter(
                      (s) => slotStart < s.end && slotEnd > s.start
                    )

            if (conflicts.length === 0) {
                      foundSlot = new Date(candidate)
            } else {
                      const latestConflictEnd = Math.max(...conflicts.map((s) => s.end))
                      candidate = new Date(latestConflictEnd)
                      const candidateHour = candidate.getUTCHours()
                      if (candidateHour >= 18) {
                                  candidate.setUTCDate(candidate.getUTCDate() + 1)
                                  candidate.setUTCHours(8, 0, 0, 0)
                      }
            }
      }

      if (!foundSlot) {
              return NextResponse.json({ error: "No available slot found in the next 14 days" }, { status: 422 })
      }

      await supabase
            .from("booking_requests")
            .update({
                      dispatch_slot_offered: foundSlot.toISOString(),
                      dispatch_sent_at: new Date().toISOString(),
                      status: "slot_offered",
            })
            .eq("id", booking_request_id)

      fetch(`${BASE_URL}/api/dispatch/sms-notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ booking_request_id }),
      }).catch(() => {})

      return NextResponse.json({ success: true, slot: foundSlot.toISOString() })
    } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return NextResponse.json({ error: message }, { status: 500 })
    }
}
