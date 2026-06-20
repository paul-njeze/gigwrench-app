import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatch } from '@/lib/notify'
import { renderEmail, escapeHtml, FOOTER_DISPATCH } from '@/lib/notify/shell'

export const runtime = 'edge'

function buildArrivedEmail(
  customerName: string,
  proName: string,
  jobTitle: string
): string {
  const cardHtml = `<p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#F9FAFB;">Your Pro has arrived</p>
          <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">Hi ${escapeHtml(customerName)}, ${escapeHtml(proName)} has arrived for your ${escapeHtml(jobTitle)} appointment.</p>
          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">Please make sure they can reach the work area. Thank you for choosing GigWrench.</p>`
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

    const { job_id } = (await req.json()) as { job_id: string }
    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 })
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Load job plus the owning Pro, verify ownership.
    const { data: job, error: jErr } = await serviceClient
      .from('jobs')
      .select('id,title,customer_id,pro_id,arrived_at,pro:profiles!jobs_pro_id_fkey(id,first_name,last_name,phone)')
      .eq('id', job_id)
      .single()

    if (jErr || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.pro_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Idempotent: if arrival already recorded, do not re-notify.
    if (job.arrived_at) {
      return NextResponse.json({ success: true, already_arrived: true, fired: [] })
    }

    const nowIso = new Date().toISOString()

    // Record arrival and close the live tracking window.
    const { error: updErr } = await serviceClient
      .from('jobs')
      .update({ arrived_at: nowIso, tracking_active: false })
      .eq('id', job_id)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

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

    const customerName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'there' : 'there'
    const prefs = (customer?.notification_prefs ?? {}) as Record<string, boolean>

    // Notifications flow through the spine. Arrival is already idempotent via
    // arrived_at above; the dedupe key is a second guard and records the event.
    const result = await dispatch({
      recipientId: job.customer_id,
      to: { email: customer?.email ?? null, phone: customer?.phone ?? null },
      type: 'arrived',
      dedupeKey: `arrived:${job_id}`,
      prefKeys: { email: 'email_on_the_way', sms: 'sms_on_the_way' },
      prefs,
      email: {
        from: 'dispatch@gigwrench.app',
        subject: `${proName} has arrived`,
        html: buildArrivedEmail(customerName, proName, job.title),
      },
      sms: {
        body: `Hi ${customerName}, ${proName} has arrived for your appointment.`,
      },
    })

    return NextResponse.json({ success: true, fired: result.fired })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
