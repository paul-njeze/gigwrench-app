'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'

function VerifyContent() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function resendEmail() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setResent(true)
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
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-yellow-400"/>
          </div>

          <h1 className="font-display text-4xl tracking-wider text-white mb-3">Check Your Email.</h1>
          <p className="text-white/50 text-sm font-mono leading-relaxed mb-2">
            We sent a verification link to
          </p>
          {email && (
            <p className="text-yellow-400 font-mono text-sm font-medium mb-6 bg-yellow-400/8 border border-yellow-400/20 rounded-lg px-4 py-2 inline-block">
              {email}
            </p>
          )}

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-6 mb-6 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">What to do next</p>
            <div className="flex flex-col gap-3">
              {[
                'Open your email inbox',
                'Find the email from GigWrench',
                'Click the "Confirm your email" button',
                'You will be signed in automatically',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm text-yellow-400">{i + 1}</span>
                  </div>
                  <span className="text-white/60 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {!resent ? (
            <button onClick={resendEmail} disabled={loading}
              className="flex items-center gap-2 mx-auto text-white/30 hover:text-white/60 transition-colors font-mono text-xs disabled:opacity-40">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>
              {loading ? 'Sending...' : "Didn't receive it? Resend email"}
            </button>
          ) : (
            <div className="flex items-center gap-2 justify-center text-green-400 font-mono text-xs">
              <CheckCircle2 size={12}/>
              Verification email resent
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/6">
            <p className="text-white/20 font-mono text-xs">
              Wrong email?{' '}
              <Link href="/signup" className="text-yellow-400/60 hover:text-yellow-400 transition-colors">
                Go back and try again
              </Link>
            </p>
            <p className="text-white/10 font-mono text-[10px] mt-3">
              This verification link expires in 24 hours · NIST IA-5 compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent/>
    </Suspense>
  )
}