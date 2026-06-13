'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={28} className="text-yellow-400"/>
        </div>
        <h1 className="text-white font-bold text-2xl mb-3 tracking-tight">
          ID Verification
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Pro identity verification is coming soon. Verified Pros get a
          shield badge on their profile and rank higher in search results.
        </p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl text-sm no-underline hover:bg-yellow-300 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
