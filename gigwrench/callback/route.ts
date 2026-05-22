import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NIST AU-2, AU-3: Auth callback — all events logged by Supabase
// NIST AC-2: Account creation via OAuth handled here
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'customer'
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    // NIST IA-5: Token exchange — short-lived code for session token
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is a new user (no profile yet)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // New user — create their profile
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
          country: 'US',
        })

        // Create role-specific profile
        if (userRole === 'pro') {
          await supabase.from('pro_profiles').insert({ id: data.user.id })
        } else {
          await supabase.from('customer_profiles').insert({ id: data.user.id })
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

  // NIST AU-6: Log failed authentication — redirect to error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
