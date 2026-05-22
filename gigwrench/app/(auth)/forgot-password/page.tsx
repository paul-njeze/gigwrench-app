'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setSent(true)
    setLoading(false)
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

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="font-display text-5xl tracking-wider text-white mb-2">Reset Password.</h1>
                <p className="text-white/50 font-mono text-sm">Enter your email and we will send you a reset link.</p>
              </div>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"/>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full bg-[#131C28] border border-white/8 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"
                      placeholder="you@email.com"/>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">{error}</div>
                )}

                <button type="submit" disabled={loading || !email}
                  className="bg-yellow-400 text-black font-display text-xl tracking-widest py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-white/15 font-mono text-[10px] text-center mt-6">
                Reset links expire in 1 hour · NIST IA-5 compliant
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={28} className="text-green-400"/>
              </div>
              <h1 className="font-display text-4xl tracking-wider text-white mb-3">Check Your Email.</h1>
              <p className="text-white/50 font-mono text-sm leading-relaxed mb-6">
                If an account exists for <span className="text-yellow-400">{email}</span>, you will receive a password reset link shortly.
              </p>
              <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 text-left mb-6">
                <p className="text-white/30 font-mono text-xs leading-relaxed">
                  For your security, we do not confirm whether an email address is registered. This prevents account enumeration attacks.
                </p>
              </div>
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors font-mono text-sm no-underline">
                ← Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}