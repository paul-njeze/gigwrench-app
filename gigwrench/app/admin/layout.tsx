'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, Users, UserPlus, BarChart3, Flag, Inbox, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/accounts', label: 'Accounts', icon: Users },
  { href: '/admin/signups', label: 'Sign ups', icon: UserPlus },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('admin_users')
        .select('level')
        .eq('profile_id', user.id)
        .maybeSingle()
      if (data) setState('ok')
      else { setState('denied'); router.push('/') }
    }
    check()
  }, [router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (state !== 'ok') {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
          {state === 'loading' ? 'Checking access' : 'Access denied'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-white">
      <header className="border-b border-white/8 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 bg-[#07090D]/90 backdrop-blur z-40">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-yellow-400" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/80">GigWrench Admin</span>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          <LogOut size={12} /> Sign out
        </button>
      </header>
      <nav className="border-b border-white/8 px-4 sm:px-6 flex gap-1 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${active ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/40 hover:text-white/70'}`}>
              <Icon size={12} /> {label}
            </Link>
          )
        })}
      </nav>
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
