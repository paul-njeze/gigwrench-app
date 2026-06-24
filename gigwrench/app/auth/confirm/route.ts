import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient, type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NIST AU-2, AU-3: Email confirmation callback, all events logged by Supabase
// NIST AC-2: Account creation via email OTP handled here
//
// Email confirmation links are routinely opened in a different browser or an
// in app email webview than the one used to sign up. The PKCE code exchange in
// /auth/callback needs the code verifier cookie from the original browser, so
// it cannot be relied on for email confirmation. verifyOtp on a token_hash does
// not use the verifier, so this route works across browsers and devices.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const role = searchParams.get('role') || 'customer'
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    // NIST IA-5: Verify the one time email token and establish the session
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error && data.user) {
      // Check if this is a new user (no profile yet)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // New user, create their profile
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
          // new customer onto those jobs so in app chat and the live tracker
          // resolve immediately. This runs through the service role because the
          // jobs belong to the inviting Pro, not this customer, so an RLS scoped
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

  // NIST AU-6: Log failed verification, redirect to error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
