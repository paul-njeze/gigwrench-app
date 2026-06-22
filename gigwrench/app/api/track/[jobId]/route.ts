import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Public, read-only tracking metadata for a shareable link. The default view is
// the customer following their Pro. If the request carries a valid token for the
// job's assigned Pro, it flips to the Pro view, where the contact is the customer.
// Only safe fields are returned and the jobs table is never exposed.
export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  try {
    const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: jobRaw } = await svc.from('jobs').select('lat,lng,status,pro_id,customer_id,title').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { lat: number | null; lng: number | null; status: string; pro_id: string | null; customer_id: string | null; title: string | null } | null
    if (!job) return NextResponse.json({ ok: false }, { status: 404 })

    async function profile(id: string | null) {
      if (!id) return null
      const { data } = await svc.from('profiles').select('first_name,phone').eq('id', id).maybeSingle()
      return data as unknown as { first_name: string | null; phone: string | null } | null
    }

    // The Pro's identity always drives the tracking labels, since it is the Pro's van moving.
    const pro = await profile(job.pro_id)
    const proName = pro?.first_name || 'Your Pro'

    // If a valid token identifies the assigned Pro, switch to the Pro view.
    let viewerIsPro = false
    const auth = req.headers.get('Authorization') || ''
    if (auth.startsWith('Bearer ') && job.pro_id) {
      try {
        const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
          global: { headers: { Authorization: auth } },
        })
        const { data: { user } } = await anon.auth.getUser()
        if (user && user.id === job.pro_id) viewerIsPro = true
      } catch {}
    }

    let role: 'pro' | 'customer' = 'customer'
    let contactName = proName
    let contactPhone = pro?.phone || null
    let customerName = 'your customer'

    if (viewerIsPro) {
      role = 'pro'
      const cust = await profile(job.customer_id)
      customerName = cust?.first_name || 'your customer'
      contactName = customerName
      contactPhone = cust?.phone || null
    }

    return NextResponse.json({
      ok: true,
      role,
      proName,
      customerName,
      contactName,
      contactPhone,
      status: job.status,
      title: job.title,
      destination: job.lat != null && job.lng != null ? { lat: job.lat, lng: job.lng } : null,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
