import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Pull every auth user, paginated, so incomplete onboarders are included.
    type AuthUser = {
      id: string
      email?: string
      created_at: string
      email_confirmed_at?: string | null
      last_sign_in_at?: string | null
      user_metadata?: Record<string, unknown>
    }
    const users: AuthUser[] = []
    let page = 1
    while (page <= 20) {
      const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) break
      users.push(...(data.users as unknown as AuthUser[]))
      if (data.users.length < 1000) break
      page += 1
    }

    // Merge profile data where it exists.
    const { data: profiles } = await serviceClient
      .from('profiles')
      .select('id,first_name,last_name,role,account_status,onboarding_completed')
    const pmap = new Map<string, Record<string, unknown>>()
    for (const p of profiles || []) pmap.set(p.id as string, p as Record<string, unknown>)

    const signups = users.map(u => {
      const p = pmap.get(u.id)
      const first = (p?.first_name as string) || ''
      const last = (p?.last_name as string) || ''
      return {
        id: u.id,
        email: u.email || '',
        name: `${first} ${last}`.trim(),
        role: (p?.role as string) || (u.user_metadata?.role as string) || '',
        confirmed: !!u.email_confirmed_at,
        onboarded: !!(p?.onboarding_completed),
        has_profile: !!p,
        account_status: (p?.account_status as string) || 'no profile',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
      }
    })
    signups.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

    return NextResponse.json({ signups, total: signups.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
