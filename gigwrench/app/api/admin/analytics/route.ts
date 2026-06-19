import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
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
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: adminRow } = await serviceClient
      .from('admin_users').select('level').eq('profile_id', user.id).maybeSingle()
    if (!adminRow) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: profiles } = await serviceClient
      .from('profiles').select('role,account_status,created_at')
    const { data: jobs } = await serviceClient
      .from('jobs').select('status')
    const { count: openInvestigations } = await serviceClient
      .from('investigations').select('id', { count: 'exact', head: true }).eq('status', 'open')

    const P = profiles || []
    const J = jobs || []
    const tally = (arr: { [k: string]: unknown }[], key: string) =>
      arr.reduce((m: Record<string, number>, r) => {
        const k = (r[key] as string) || 'unknown'
        m[k] = (m[k] || 0) + 1
        return m
      }, {})

    const roleCounts = tally(P, 'role')
    const statusCounts = tally(P, 'account_status')
    const jobStatusCounts = tally(J, 'status')

    // New accounts per day for the last 14 days.
    const days: { date: string; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setUTCHours(0, 0, 0, 0)
      d.setUTCDate(d.getUTCDate() - i)
      const key = d.toISOString().slice(0, 10)
      const count = P.filter(p => (p.created_at as string || '').slice(0, 10) === key).length
      days.push({ date: key, count })
    }

    return NextResponse.json({
      accounts: { total: P.length, pros: roleCounts.pro || 0, customers: roleCounts.customer || 0 },
      status: {
        active: statusCounts.active || 0,
        warned: statusCounts.warned || 0,
        suspended: statusCounts.suspended || 0,
        disabled: statusCounts.disabled || 0,
      },
      jobs: { total: J.length, completed: jobStatusCounts.completed || 0, byStatus: jobStatusCounts },
      investigations: { open: openInvestigations || 0 },
      signupsByDay: days,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
