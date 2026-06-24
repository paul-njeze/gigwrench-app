// FILE: app/portal/layout.tsx  (commit via GitHub Contents API, Rule 19, not the Chrome agent)
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LangProvider, useLang, LANGUAGES, type Language } from '@/lib/lang'
import { Home, Briefcase, FileText, LogOut, ChevronDown, Menu, X, Wrench } from 'lucide-react'
import TourOverlay, { CUSTOMER_STEPS } from '@/components/TourOverlay'

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const [showLang, setShowLang] = useState(false)

  const nav = [
    { href: '/portal', icon: Home, key: 'cp_home', tour: 'tour-cp-home' },
    { href: '/portal/jobs', icon: Briefcase, key: 'cp_jobs', tour: 'tour-cp-jobs' },
    { href: '/portal/invoices', icon: FileText, key: 'cp_invoices', tour: 'tour-cp-invoices' },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] border-r border-white/6">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <Wrench size={14} className="text-yellow-400"/>
          </div>
          <span className="font-display text-lg tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </div>
        {onClose && <button onClick={onClose} className="text-white/30 hover:text-white lg:hidden"><X size={18}/></button>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, key, tour }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={onClose}
              data-tour={tour}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm no-underline group
                ${active ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'text-white/40 hover:text-white hover:bg-white/4'}`}>
              <Icon size={16} className={active ? 'text-yellow-400' : 'text-white/30 group-hover:text-white/60'}/>
              <span className="font-mono text-xs uppercase tracking-widest">{t(key)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Language selector */}
      <div className="px-3 pb-2">
        <button onClick={() => setShowLang(!showLang)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/4 transition-all">
          <span className="text-base">{LANGUAGES[lang].flag}</span>
          <span className="font-mono text-xs uppercase tracking-widest flex-1 text-left">{LANGUAGES[lang].label}</span>
          <ChevronDown size={12} className={`transition-transform ${showLang ? 'rotate-180' : ''}`}/>
        </button>
        {showLang && (
          <div className="bg-[#131C28] border border-white/8 rounded-lg mt-1 overflow-hidden">
            {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, info]) => (
              <button key={code} onClick={() => { setLang(code); setShowLang(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors
                  ${lang === code ? 'text-yellow-400' : 'text-white/50'}`}>
                <span>{info.flag}</span>
                <span className="font-mono text-xs">{info.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/6 pt-3">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut size={16}/>
          <span className="font-mono text-xs uppercase tracking-widest">{t('logout')}</span>
        </button>
      </div>
    </div>
  )
}

function PortalShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#07090D]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0 h-full">
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}/>
          <aside className="relative w-56 h-full z-10">
            <SidebarContent onClose={() => setSidebarOpen(false)}/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-[#0B0F17]">
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white transition-colors">
            <Menu size={20}/>
          </button>
          <span className="font-display text-lg tracking-widest text-white">GIG<span className="text-yellow-400">WRENCH</span></span>
        </div>
        {children}
      </main>
    </div>
  )
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userLang, setUserLang] = useState<Language>('en')
  const [showTour, setShowTour] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('language, role, account_status, tour_completed')
        .eq('id', user.id)
        .single()
      const status = (profile as { account_status?: string } | null)?.account_status
      if (status === 'suspended' || status === 'disabled') {
        await supabase.auth.signOut()
        router.push('/login?status=' + status)
        return
      }
      // Role guard: only customers belong in the portal. Bounce everyone else to the Pro shell.
      if (profile?.role !== 'customer') {
        router.push('/dashboard')
        return
      }
      if (profile?.language) setUserLang(profile.language as Language)
      setUserId(user.id)
      setUserRole(profile?.role || '')
      if (!profile?.tour_completed) setShowTour(true)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    function onStartTour() {
      if (userRole === 'customer') setShowTour(true)
    }
    window.addEventListener('gw-start-tour', onStartTour)
    return () => window.removeEventListener('gw-start-tour', onStartTour)
  }, [userRole])

  if (loading) return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
        <span className="font-mono text-xs text-white/30 tracking-widest uppercase">Loading</span>
      </div>
    </div>
  )

  return (
    <LangProvider defaultLang={userLang}>
      {showTour && CUSTOMER_STEPS.length > 0 && (
        <TourOverlay
          userId={userId}
          steps={CUSTOMER_STEPS}
          onComplete={() => setShowTour(false)}
        />
      )}
      <PortalShell>{children}</PortalShell>
    </LangProvider>
  )
}
