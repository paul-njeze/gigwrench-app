// FILE: app/portal/page.tsx  (commit via GitHub Contents API, Rule 19, not the Chrome agent)
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { Briefcase, FileText, MapPin, Clock, ChevronRight, Wrench, CalendarCheck } from 'lucide-react'

interface PortalJob {
  id: string
  title: string
  scheduled_at: string
  address: string | null
  status: string
  currency: string | null
  quoted_amount: number | null
  final_amount: number | null
  pro: { business_name: string | null; trading_name: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/25',
  on_the_way: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/25',
  in_progress: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  completed: 'bg-green-500/15 text-green-400 border-green-500/25',
  invoiced: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  paid: 'bg-green-500/15 text-green-400 border-green-500/25',
}

function greetingKey(): string {
  const h = new Date().getHours()
  if (h < 12) return 'good_morning'
  if (h < 18) return 'good_afternoon'
  return 'good_evening'
}

function money(amount: number | null, currency: string | null, lang: string): string {
  if (amount == null) return ''
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

export default function PortalHome() {
  const { t, lang } = useLang()
  const [userName, setUserName] = useState('')
  const [nextJob, setNextJob] = useState<PortalJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('first_name').eq('id', user.id).single()
      if (profile?.first_name) setUserName(profile.first_name)

      const nowIso = new Date().toISOString()
      const { data: jobs } = await supabase.from('jobs')
        .select('id, title, scheduled_at, address, status, currency, quoted_amount, final_amount, pro:pro_profiles(business_name, trading_name)')
        .eq('customer_id', user.id)
        .gte('scheduled_at', nowIso)
        .in('status', ['scheduled', 'confirmed', 'on_the_way', 'in_progress'])
        .order('scheduled_at', { ascending: true })
        .limit(1)

      const next = jobs && jobs.length > 0 ? (jobs[0] as unknown as PortalJob) : null
      setNextJob(next)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  const proName = nextJob?.pro?.business_name || nextJob?.pro?.trading_name || ''
  const amount = money(nextJob?.final_amount ?? nextJob?.quoted_amount ?? null, nextJob?.currency ?? null, lang)

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">{t(greetingKey())}</p>
        <h1 className="font-display text-4xl tracking-wider text-white">{userName || t('welcome_back')}</h1>
        <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Next appointment */}
      <div className="mb-8">
        <h2 className="font-display text-2xl tracking-wider text-white mb-4">{t('cp_next_appt')}</h2>

        {!nextJob ? (
          <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-8 text-center">
            <CalendarCheck size={28} className="text-white/15 mx-auto mb-3"/>
            <p className="text-white/30 text-sm font-mono">{t('cp_no_upcoming')}</p>
          </div>
        ) : (
          <Link href={`/portal/jobs/${nextJob.id}`}
            className="block bg-[#0B0F17] border border-white/6 rounded-xl p-5 hover:border-yellow-400/20 transition-all no-underline group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[nextJob.status] || STATUS_COLORS.scheduled}`}>
                    {t(nextJob.status).replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[9px] text-white/25 flex items-center gap-1">
                    <Clock size={9}/>
                    {new Date(nextJob.scheduled_at).toLocaleString(lang, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-white font-medium text-base truncate group-hover:text-yellow-400 transition-colors">{nextJob.title}</h3>
                {proName && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Wrench size={11} className="text-yellow-400/60 flex-shrink-0"/>
                    <span className="font-mono text-[11px] text-white/40 truncate">{proName}</span>
                  </div>
                )}
                {nextJob.address && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} className="text-white/25 flex-shrink-0"/>
                    <span className="font-mono text-[11px] text-white/30 truncate">{nextJob.address}</span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {amount && <div className="font-display text-xl tracking-wider text-green-400">{amount}</div>}
                <ChevronRight size={16} className="text-white/20 mt-1 ml-auto"/>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/portal/jobs"
          className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 hover:border-yellow-400/20 transition-all no-underline group flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} className="text-yellow-400"/>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-white/60 group-hover:text-white flex-1">{t('cp_jobs')}</span>
          <ChevronRight size={14} className="text-white/20"/>
        </Link>
        <Link href="/portal/invoices"
          className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 hover:border-yellow-400/20 transition-all no-underline group flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/8 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-yellow-400"/>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-white/60 group-hover:text-white flex-1">{t('cp_invoices')}</span>
          <ChevronRight size={14} className="text-white/20"/>
        </Link>
      </div>

    </div>
  )
}
