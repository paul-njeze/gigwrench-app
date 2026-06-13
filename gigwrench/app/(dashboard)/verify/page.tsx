'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data: pro } = await supabase
        .from('pro_profiles')
        .select('id_verified')
        .eq('id', user.id)
        .single()
      if (pro?.id_verified) {
        setVerified(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!userId) return
    const templateId = process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID
    if (!templateId) return
    const script = document.createElement('script')
    script.src = 'https://cdn.withpersona.com/dist/persona-v4.8.0.js'
    script.onload = () => {
      const client = new (window as never as { Persona: { Client: new (config: unknown) => { open: () => void } } }).Persona.Client({
        templateId,
        referenceId: userId,
        environmentId: 'sandbox',
        onComplete: () => {
          setVerified(true)
          setTimeout(() => router.push('/dashboard'), 2000)
        },
        onFail: () => {},
        onExit: () => {},
      })
      client.open()
    }
    document.head.appendChild(script)
  }, [userId, router])

  if (loading) return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  if (verified) return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={28} className="text-green-400"/>
        </div>
        <p className="text-white font-semibold text-lg mb-2">Identity Verified</p>
        <p className="text-white/40 text-sm">Taking you to your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#131C28] border border-white/8 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={28} className="text-yellow-400"/>
        </div>
        <h1 className="text-white font-bold text-xl mb-3">Verify Your Identity</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          GigWrench lets real people into real homes. Verification
          protects you, your customers, and their property. It takes
          under 2 minutes.
        </p>
        <p className="text-white/30 text-xs">
          The verification window should open automatically.
          If it did not, refresh this page.
        </p>
      </div>
    </div>
  )
}
