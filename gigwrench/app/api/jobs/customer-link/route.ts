import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Links a registered customer account to a job so in-app chat and the live
// tracker can resolve the customer party. Only the Pro who owns the job
// (jobs.pro_id === caller) may search, link, or unlink. Customer profile
// reads run through the service-role client and return minimal fields only,
// so a Pro never sees a customer's contact details through this route.

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: 'pro' | 'customer'
}

function svcClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: auth } } },
    )
    const { data: { user } } = await anon.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

function shape(p: ProfileRow | null) {
  if (!p) return null
  return {
    id: p.id,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    avatarUrl: p.avatar_url || null,
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const op = typeof body.op === 'string' ? body.op : ''
    const jobId = typeof body.jobId === 'string' ? body.jobId : ''
    if (!jobId) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })

    const svc = svcClient()

    // Every op is scoped to a job the caller owns. This also gates who may
    // search the customer pool: only a Pro acting on their own job.
    const { data: jobRaw } = await svc.from('jobs').select('id,pro_id,customer_id').eq('id', jobId).maybeSingle()
    const job = jobRaw as unknown as { id: string; pro_id: string | null; customer_id: string | null } | null
    if (!job) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    if (job.pro_id !== userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    async function profileById(id: string | null): Promise<ProfileRow | null> {
      if (!id) return null
      const { data } = await svc.from('profiles').select('id,first_name,last_name,avatar_url,role').eq('id', id).maybeSingle()
      return data as unknown as ProfileRow | null
    }

    if (op === 'current') {
      const cur = await profileById(job.customer_id)
      return NextResponse.json({ ok: true, customer: shape(cur) })
    }

    if (op === 'search') {
      const raw = typeof body.q === 'string' ? body.q.trim() : ''
      if (raw.length < 2) return NextResponse.json({ ok: true, results: [] })
      // Strip characters that would break the PostgREST or() filter grammar.
      const safe = raw.replace(/[%,()]/g, ' ').slice(0, 60)
      const { data } = await svc
        .from('profiles')
        .select('id,first_name,last_name,avatar_url,role')
        .eq('role', 'customer')
        .or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%`)
        .limit(8)
      const rows = (data || []) as unknown as ProfileRow[]
      return NextResponse.json({ ok: true, results: rows.map(shape) })
    }

    if (op === 'link') {
      const customerId = typeof body.customerId === 'string' ? body.customerId : ''
      if (!customerId) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
      const cust = await profileById(customerId)
      if (!cust || cust.role !== 'customer') {
        return NextResponse.json({ ok: false, error: 'not_a_customer' }, { status: 400 })
      }
      const { error } = await svc.from('jobs').update({ customer_id: customerId }).eq('id', jobId)
      if (error) return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 200 })
      return NextResponse.json({ ok: true, customer: shape(cust) })
    }

    if (op === 'unlink') {
      const { error } = await svc.from('jobs').update({ customer_id: null }).eq('id', jobId)
      if (error) return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 200 })
      return NextResponse.json({ ok: true, customer: null })
    }

    return NextResponse.json({ ok: false, error: 'unknown_op' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 200 })
  }
}
