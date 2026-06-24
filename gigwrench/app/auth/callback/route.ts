import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NIST AU-2, AU-3: Auth callback -- all events logged by Supabase
// NIST AC-2: Account creation via OAuth handled here
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'customer'
  const nextParam = searchParams.get('next')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    // NIST IA-5: Token exchange -- short-lived code for session token
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is a new user (no profile yet)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // New user -- create their profile
        // NIST AC-2: Account provisioning
        const meta = data.user.user_metadata
        const userRole = meta?.role || role

        await supabase.from('profiles').insert({
          id: data.user.id,
          role: userRole,
          first_name: meta?.first_name || meta?.full_name?.split(' ')[0] || '',
          last_name: meta?.last_name || meta?.full_name?.split(' ').slice(1).join(' ') || '',
          email: data.user.email || '',
          language: meta?.language || 'en',
          country: meta?.country || 'US',
          currency_code: meta?.currency_code || 'USD',
          currency_symbol: meta?.currency_symbol || '',
        })

        // Create role-specific profile
        if (userRole === 'pro') {
          await supabase.from('pro_profiles').insert({ id: data.user.id })
        } else {
          await supabase.from('customer_profiles').insert({ id: data.user.id })

          // Accept any pending job invites addressed to this email, stamping the
          // new customer onto those jobs so in-app chat and the live tracker
          // resolve immediately. This runs through the service role because the
          // jobs belong to the inviting Pro, not this customer, so an RLS-scoped
          // session client could not update them. Best effort: a failure here
          // never blocks account creation.
          try {
            const inviteEmail = (data.user.email || '').toLowerCase()
            if (inviteEmail && process.env.SUPABASE_SERVICE_ROLE_KEY) {
              const svc = createServiceClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
              )
              const nowIso = new Date().toISOString()
              const { data: invites } = await svc
                .from('job_customer_invites')
                .select('id, job_id')
                .eq('status', 'pending')
                .ilike('customer_email', inviteEmail)
                .gt('expires_at', nowIso)
              for (const inv of (invites || []) as { id: string; job_id: string }[]) {
                await svc.from('jobs').update({ customer_id: data.user.id }).eq('id', inv.job_id).is('customer_id', null)
                await svc.from('job_customer_invites').update({ status: 'accepted', accepted_by: data.user.id, accepted_at: nowIso }).eq('id', inv.id)
              }
            }
          } catch {
            // Invite acceptance is best effort and never blocks signup.
          }
        }
      }

      const existingRole = (existingProfile as { role?: string | null } | null)?.role
      const effectiveRole = existingRole || data.user.user_metadata?.role || role
      const next = nextParam ?? (effectiveRole === 'customer' ? '/portal' : '/dashboard')

      // NIST AC-2: Redirect to appropriate page
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // NIST AU-6: Log failed authentication -- redirect to error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
