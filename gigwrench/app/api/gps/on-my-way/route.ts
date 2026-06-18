import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const TRACKING_BASE = 'https://app.gigwrench.app/track'

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

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GigWrench/1.0 (dispatch@gigwrench.app)' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ lat: string; lon: string }>
    if (!data || data.length === 0) return null
    const gLat = parseFloat(data[0].lat)
    const gLng = parseFloat(data[0].lon)
    if (Number.isNaN(gLat) || Number.isNaN(gLng)) return null
    return { lat: gLat, lng: gLng }
  } catch {
    return null
  }
}

function buildOnMyWayEmail(
  customerName: string,
  proName: string,
  jobTitle: string,
  trackingUrl: string
): string {
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
          <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#F9FAFB;">Your Pro is on the way</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">Hi ${customerName}, ${proName} is heading to you now for your ${jobTitle} appointment.</p>
          <a href="${trackingUrl}" style="display:block;background:#F5C518;color:#000000;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:24px;">Track arrival live</a>
          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">The live map updates as your Pro travels. Keep this page open to watch the arrival in real time.</p>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#374151;">Dispatch by GigWrench. The field service OS for Pros and the people they serve.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const accessToken = authHeader.replace('Bearer ', '')

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )

    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { job_id, lat, lng } = (await req.json()) as {
      job_id: string
      lat: number
      lng: number
    }
    if (!job_id || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'job_id, lat and lng are required' },
        { status: 400 }
      )
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Load job plus the owning Pro, then verify ownership before any writes.
    const { data: job, error: jErr } = await serviceClient
      .from('jobs')
      .select('id,title,address,lat,lng,customer_id,pro_id,pro:profiles!jobs_pro_id_fkey(id,first_name,last_name,phone)')
      .eq('id', job_id)
      .single()

    if (jErr || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.pro_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const nowIso = new Date().toISOString()

    // Atomic state write: flip the job into the live On My Way state.
    const jobUpdate: Record<string, unknown> = {
      status: 'on_the_way',
      tracking_active: true,
      on_the_way_at: nowIso,
      pro_lat: lat,
      pro_lng: lng,
    }
    // Geocode the destination once if the job has an address but no coordinates,
    // so automatic arrival detection works. Best effort: never blocks the trip.
    const jobGeo = job as unknown as { address: string | null; lat: number | null; lng: number | null }
    if ((jobGeo.lat == null || jobGeo.lng == null) && jobGeo.address) {
      const geo = await geocodeAddress(jobGeo.address)
      if (geo) {
        jobUpdate.lat = geo.lat
        jobUpdate.lng = geo.lng
      }
    }
    const { error: updErr } = await serviceClient
      .from('jobs')
      .update(jobUpdate)
      .eq('id', job_id)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // Seed the first location fix so the customer map opens with a point,
    // not an empty waiting screen. One row per (pro_id, job_id).
    const { data: existingLoc } = await serviceClient
      .from('pro_locations')
      .select('id')
      .eq('pro_id', user.id)
      .eq('job_id', job_id)
      .maybeSingle()
    if (existingLoc) {
      await serviceClient
        .from('pro_locations')
        .update({ lat, lng, updated_at: nowIso })
        .eq('id', existingLoc.id)
    } else {
      await serviceClient
        .from('pro_locations')
        .insert({ pro_id: user.id, job_id, lat, lng })
    }

    // Resolve Pro name and customer contact for the notification legs.
    const pro = job.pro as unknown as {
      id: string
      first_name: string
      last_name: string
      phone: string | null
    }
    const proName = `${pro.first_name} ${pro.last_name}`.trim()

    const { data: customer } = await serviceClient
      .from('profiles')
      .select('first_name,last_name,phone,email,notification_prefs')
      .eq('id', job.customer_id)
      .single()

    const trackingUrl = `${TRACKING_BASE}/${job_id}`
    const fired: string[] = []
    const customerName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'there' : 'there'
    const prefs = (customer?.notification_prefs ?? {}) as Record<string, boolean>

    // Email leg: live. A mail failure never blocks the trip.
    if (customer?.email && prefs.email_on_the_way !== false) {
      try {
        const emailHtml = buildOnMyWayEmail(
          customerName,
          proName,
          job.title,
          trackingUrl
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
            subject: `${proName} is on the way`,
            html: emailHtml,
          }),
        })
        fired.push('email_sent')
      } catch {
        fired.push('email_failed')
      }
    }

    // SMS leg: dark until SMS_ENABLED is set to 'true' in Vercel once A2P clears.
    if (customer?.phone && prefs.sms_on_the_way !== false) {
      if (process.env.SMS_ENABLED === 'true') {
        try {
          await sendTwilioSMS(
            customer.phone,
            `Hi ${customerName}, ${proName} is on the way. Track arrival live: ${trackingUrl}`
          )
          fired.push('sms_sent')
        } catch {
          fired.push('sms_failed')
        }
      } else {
        fired.push('sms_skipped')
      }
    }

    return NextResponse.json({ success: true, fired })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
