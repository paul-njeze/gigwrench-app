import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatch } from '@/lib/notify'
import { renderEmail, emailButton, escapeHtml, FOOTER_DISPATCH } from '@/lib/notify/shell'

export const runtime = 'edge'

const TRACKING_BASE = 'https://app.gigwrench.app/track'

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
  const cardHtml = `<p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#F9FAFB;">Your Pro is on the way</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">Hi ${escapeHtml(customerName)}, ${escapeHtml(proName)} is heading to you now for your ${escapeHtml(jobTitle)} appointment.</p>
          ${emailButton('Track arrival live', trackingUrl)}
          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">The live map updates as your Pro travels. Keep this page open to watch the arrival in real time.</p>`
  return renderEmail({ cardHtml, footer: FOOTER_DISPATCH })
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
      .select('id,title,address,lat,lng,customer_id,pro_id')
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
    // jobs.pro_id points at pro_profiles, whose id mirrors the base profiles
    // row, so the Pro name lives in profiles under the same id. Fetch it
    // directly since there is no direct foreign key from jobs to profiles.
    const { data: pro } = await serviceClient
      .from('profiles')
      .select('first_name,last_name,phone')
      .eq('id', job.pro_id)
      .single()
    const proName = `${pro?.first_name ?? ''} ${pro?.last_name ?? ''}`.trim()

    const { data: customer } = await serviceClient
      .from('profiles')
      .select('first_name,last_name,phone,email,notification_prefs')
      .eq('id', job.customer_id)
      .single()

    const trackingUrl = `${TRACKING_BASE}/${job_id}`
    const customerName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'there' : 'there'
    const prefs = (customer?.notification_prefs ?? {}) as Record<string, boolean>

    // Notifications flow through the spine: email is live, SMS is gated by
    // SMS_ENABLED, both respect the customer preferences, and the event is
    // recorded once. The dedupe key makes a double tap a no op.
    const result = await dispatch({
      recipientId: job.customer_id,
      to: { email: customer?.email ?? null, phone: customer?.phone ?? null },
      type: 'on_my_way',
      dedupeKey: `on_my_way:${job_id}`,
      prefKeys: { email: 'email_on_the_way', sms: 'sms_on_the_way' },
      prefs,
      email: {
        from: 'GigWrench Dispatch <dispatch@gigwrench.app>',
        subject: `${proName} is on the way`,
        html: buildOnMyWayEmail(customerName, proName, job.title, trackingUrl),
      },
      sms: {
        body: `Hi ${customerName}, ${proName} is on the way. Track arrival live: ${trackingUrl}`,
      },
    })

    return NextResponse.json({ success: true, fired: result.fired })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
