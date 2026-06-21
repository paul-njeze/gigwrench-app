import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Public, read-only tracking metadata for a shareable link. Returns only the
// safe fields a customer needs to follow their Pro: destination coordinates and
// the Pro's first name. It never exposes the jobs table or any contact detail.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  try {
    const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: jobRaw } = await svc.from('jobs').select('lat,lng,status,pro_id,title').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { lat: number | null; lng: number | null; status: string; pro_id: string | null; title: string | null } | null
    if (!job) return NextResponse.json({ ok: false }, { status: 404 })

    let proName = 'Your Pro'
    let proPhone: string | null = null
    if (job.pro_id) {
      const { data: profRaw } = await svc.from('profiles').select('first_name,phone').eq('id', job.pro_id).maybeSingle()
      const prof = profRaw as unknown as { first_name: string | null; phone: string | null } | null
      if (prof?.first_name) proName = prof.first_name
      if (prof?.phone) proPhone = prof.phone
    }

    return NextResponse.json({
      ok: true,
      proName,
      proPhone,
      status: job.status,
      title: job.title,
      destination: job.lat != null && job.lng != null ? { lat: job.lat, lng: job.lng } : null,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
