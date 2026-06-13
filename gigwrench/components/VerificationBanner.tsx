'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert } from 'lucide-react'

export default function VerificationBanner() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (!profile) return
      setRole(profile.role)
      if (profile.role === 'pro') {
        const { data: pro } = await supabase
          .from('pro_profiles')
          .select('id_verified')
          .eq('id', user.id)
          .single()
        if (pro && !pro.id_verified) setShow(true)
      }
    }
    check()
  }, [])

  if (!show) return null

  const proMessage = 'Before you can accept jobs, we need to verify your identity. Customers trust you with their home. Verification builds that trust, unlocks your profile to searchers, and gets you your first booking faster -- it takes under 2 minutes.'
  const customerMessage = 'Before you book, we need to verify your identity. GigWrench lets real people into real homes. Verification protects you, your Pro, and your property -- it takes under 2 minutes.'

  return (
    <div className="bg-yellow-400/8 border-b border-yellow-400/20 px-4 py-3 flex items-center gap-3">
      <ShieldAlert size={16} className="text-yellow-400 flex-shrink-0"/>
      <p className="text-yellow-300/80 text-xs flex-1 leading-relaxed">
        {role === 'pro' ? proMessage : customerMessage}
      </p>
      <button
        onClick={() => router.push('/verify')}
        className="bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 hover:bg-yellow-300 transition-colors"
      >
        Verify my identity
      </button>
    </div>
  )
}
