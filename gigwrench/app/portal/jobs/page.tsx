// FILE: app/portal/jobs/page.tsx  (commit via GitHub Contents API, Rule 19, not the Chrome agent)
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { MapPin, Clock, ChevronRight, Wrench, Briefcase } from 'lucide-react'

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
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
}

const ACTIVE = ['scheduled', 'confirmed', 'on_the_way', 'in_progress']

function money(amount: number | null, currency: string | null, lang: string): string {
  if (amount == null) return ''
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

function JobRow({ job }: { job: PortalJob }) {
  const { t, lang } = useLang()
  const proName = job.pro?.business_name || job.pro?.trading_name || ''
  const amount = money(job.final_amount ?? job.quoted_amount ?? null, job.currency ?? null, lang)
  return (
    <Link href={`/portal/jobs/${job.id}`}
      className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 hover:border-yellow-400/20 transition-all no-underline group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || STATUS_COLORS.scheduled}`}>
              {t(job.status).replace(/_/g, ' ')}
            </span>
            <span className="font-mono text-[9px] text-white/25 flex items-center gap-1">
              <Clock size={9}/>
              {new Date(job.scheduled_at).toLocaleString(lang, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-white font-medium text-sm truncate group-hover:text-yellow-400 transition-colors">{job.title}</h3>
          {proName && (
            <div className="flex items-center gap-1.5 mt-1">
              <Wrench size={10} className="text-yellow-400/60 flex-shrink-0"/>
              <span className="font-mono text-[10px] text-white/40 truncate">{proName}</span>
            </div>
          )}
          {job.address && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} className="text-white/25 flex-shrink-0"/>
              <span className="font-mono text-[10px] text-white/30 truncate">{job.address}</span>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {amount && <div className="font-display text-lg tracking-wider text-green-400">{amount}</div>}
          <ChevronRight size={14} className="text-white/20 mt-1 ml-auto"/>
        </div>
      </div>
    </Link>
  )
}

export default function PortalJobs() {
  const { t } = useLang()
  const [jobs, setJobs] = useState<PortalJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('jobs')
        .select('id, title, scheduled_at, address, status, currency, quoted_amount, final_amount, pro:pro_profiles(business_name, trading_name)')
        .eq('customer_id', user.id)
        .order('scheduled_at', { ascending: false })
      setJobs((data as unknown as PortalJob[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  const now = Date.now()
  const upcoming = jobs
    .filter(j => ACTIVE.includes(j.status) && new Date(j.scheduled_at).getTime() >= now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const upcomingIds = new Set(upcoming.map(j => j.id))
  const past = jobs.filter(j => !upcomingIds.has(j.id))

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl tracking-wider text-white mb-8">{t('cp_jobs')}</h1>

      {jobs.length === 0 ? (
        <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-10 text-center">
          <Briefcase size={28} className="text-white/15 mx-auto mb-3"/>
          <p className="text-white/30 text-sm font-mono">{t('cp_no_jobs')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-3">{t('cp_upcoming')}</h2>
              <div className="flex flex-col gap-2">
                {upcoming.map(j => <JobRow key={j.id} job={j}/>)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-3">{t('cp_past')}</h2>
              <div className="flex flex-col gap-2">
                {past.map(j => <JobRow key={j.id} job={j}/>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
