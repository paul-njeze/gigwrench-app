'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react'

// NIST IA-5: Password change for account recovery. The recovery session is
// established before this page loads, by /auth/callback (PKCE code exchange) or
// /auth/confirm (token_hash verifyOtp), both of which honor next and land the
// user here at /reset-password. This page reads that session, accepts a new
// password via supabase.auth.updateUser, then signs the user out so the new
// credential must be used to sign back in.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let settled = false

    // A valid recovery link sets a session, either from cookies written by the
    // auth route or from the URL hash the browser client parses on load. Either
    // a live session or a recovery event means the link was good.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        settled = true
        setReady(true)
        setChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        settled = true
        setReady(true)
      }
      setChecking(false)
    })

    // If nothing establishes a session shortly after load, treat the link as
    // invalid or expired and stop the spinner.
    const timer = setTimeout(() => {
      if (!settled) setChecking(false)
    }, 2500)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // NIST IA-5: Invalidate the recovery session so the new password must be
    // entered to sign back in.
    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/login?reset=success'), 1800)
  }

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="6" r="1.5" fill="#FF6B2B"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Link href="/login" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors font-mono text-xs mb-8 no-underline">
            <ArrowLeft size={12}/> Back to sign in
          </Link>

          {checking ? (
            <div className="text-center py-12">
              <p className="text-white/40 font-mono text-sm animate-pulse">Verifying reset link...</p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={28} className="text-red-400"/>
              </div>
              <h1 className="font-display text-4xl tracking-wider text-white mb-3">Link Invalid or Expired.</h1>
              <p className="text-white/50 font-mono text-sm leading-relaxed mb-6">
                This reset link is no longer valid. Request a fresh one and it will arrive within a minute.
              </p>
              <Link href="/forgot-password" className="text-yellow-400 hover:text-yellow-300 transition-colors font-mono text-sm no-underline">
                Request a new reset link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={28} className="text-green-400"/>
              </div>
              <h1 className="font-display text-4xl tracking-wider text-white mb-3">Password Updated.</h1>
              <p className="text-white/50 font-mono text-sm leading-relaxed">
                Redirecting you to sign in with your new password...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-5xl tracking-wider text-white mb-2">New Password.</h1>
                <p className="text-white/50 font-mono text-sm">Choose a new password for your account.</p>
              </div>

              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"/>
                    <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      className="w-full bg-[#131C28] border border-white/8 rounded-lg pl-10 pr-12 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                      placeholder="At least 8 characters"/>
                    <button type="button" onClick={() => setShow(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                      {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"/>
                    <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                      className="w-full bg-[#131C28] border border-white/8 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                      placeholder="Re-enter your password"/>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">{error}</div>
                )}

                <button type="submit" disabled={loading || !password || !confirm}
                  className="bg-yellow-400 text-black font-display text-xl tracking-widest py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <p className="text-white/15 font-mono text-[10px] text-center mt-6">
                Minimum 8 characters · NIST IA-5 compliant
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
