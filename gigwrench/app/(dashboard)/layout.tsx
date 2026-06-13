'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LangProvider, useLang, LANGUAGES, type Language } from '@/lib/lang'
import {
  LayoutDashboard, Briefcase, FileText, Users, MessageSquare,
  CalendarCheck, Settings, LogOut, ChevronDown, Menu, X, Wrench, Search, BarChart2
} from 'lucide-react'
import VerificationBanner from '@/components/VerificationBanner'

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const [showLang, setShowLang] = useState(false)

  const nav = [
    { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { href: '/jobs', icon: Briefcase, key: 'jobs' },
    { href: '/dispatch', icon: CalendarCheck, key: 'dispatch' },    { href: '/invoices', icon: FileText, key: 'invoices' },
    { href: '/customers', icon: Users, key: 'customers' },
    { href: '/analytics', icon: BarChart2, key: 'analytics' },
    { href: '/messages', icon: MessageSquare, key: 'messages' },
    { href: '/find-a-pro', icon: Search, key: 'find_a_pro' },
    { href: '/settings', icon: Settings, key: 'settings' },
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
        {nav.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm no-underline group
                ${active ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'text-white/40 hover:text-white hover:bg-white/4'}`}>
              <Icon size={16} className={active ? 'text-yellow-400' : 'text-white/30 group-hover:text-white/60'}/>
              <span className="font-mono text-xs uppercase tracking-widest">{t(key)}</span>
              {key === 'messages' && (
                <span className="ml-auto bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">3</span>
              )}
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

function DashboardShell({ children }: { children: React.ReactNode }) {
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
        <VerificationBanner />
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userLang, setUserLang] = useState<Language>('en')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      // Get user's preferred language
      const { data: profile } = await supabase.from('profiles').select('language').eq('id', user.id).single()
      if (profile?.language) setUserLang(profile.language as Language)
      setLoading(false)
    }
    checkAuth()
  }, [router])

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
      <DashboardShell>{children}</DashboardShell>
    </LangProvider>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LangProvider, useLang, LANGUAGES, type Language } from '@/lib/lang'
import {
  LayoutDashboard, Briefcase, FileText, Users, MessageSquare,
  CalendarCheck, Settings, LogOut, ChevronDown, Menu, X, Wrench, Search
} from 'lucide-react'
import VerificationBanner from '@/components/VerificationBanner'

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const [showLang, setShowLang] = useState(false)

  const nav = [
    { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { href: '/jobs', icon: Briefcase, key: 'jobs' },
    { href: '/dispatch', icon: CalendarCheck, key: 'dispatch' },    { href: '/invoices', icon: FileText, key: 'invoices' },
    { href: '/customers', icon: Users, key: 'customers' },
    { href: '/messages', icon: MessageSquare, key: 'messages' },
    { href: '/find-a-pro', icon: Search, key: 'find_a_pro' },
    { href: '/settings', icon: Settings, key: 'settings' },
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
        {nav.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm no-underline group
                ${active ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' : 'text-white/40 hover:text-white hover:bg-white/4'}`}>
              <Icon size={16} className={active ? 'text-yellow-400' : 'text-white/30 group-hover:text-white/60'}/>
              <span className="font-mono text-xs uppercase tracking-widest">{t(key)}</span>
              {key === 'messages' && (
                <span className="ml-auto bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">3</span>
              )}
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

function DashboardShell({ children }: { children: React.ReactNode }) {
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
        <VerificationBanner />
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userLang, setUserLang] = useState<Language>('en')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      // Get user's preferred language
      const { data: profile } = await supabase.from('profiles').select('language').eq('id', user.id).single()
      if (profile?.language) setUserLang(profile.language as Language)
      setLoading(false)
    }
    checkAuth()
  }, [router])

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
      <DashboardShell>{children}</DashboardShell>
    </LangProvider>
  )
}
