'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { Plus, ChevronRight, Clock, MapPin, Phone, CheckCircle2, Navigation, DollarSign, Star, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  scheduled_at: string
  address: string
  status: string
  final_amount: number | null
  quoted_amount: number | null
  customer_id: string
}

interface Stats {
  earningsToday: number
  jobsThisWeek: number
  outstanding: number
  avgRating: number
}

function greeting(lang: string): string {
  const h = new Date().getHours()
  const greetings: Record<string, string[]> = {
    en: ['Good morning', 'Good afternoon', 'Good evening'],
    es: ['Buenos días', 'Buenas tardes', 'Buenas noches'],
    pt: ['Bom dia', 'Boa tarde', 'Boa noite'],
    fr: ['Bonjour', 'Bon après-midi', 'Bonsoir'],
    pl: ['Dzień dobry', 'Dzień dobry', 'Dobry wieczór'],
    ar: ['صباح الخير', 'مساء الخير', 'مساء الخير'],
  }
  const g = greetings[lang] || greetings.en
  if (h < 12) return g[0]
  if (h < 18) return g[1]
  return g[2]
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

export default function DashboardPage() {
  const { t, lang } = useLang()
  const [userName, setUserName] = useState('')
  const [todayJobs, setTodayJobs] = useState<Job[]>([])
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({ earningsToday: 0, jobsThisWeek: 0, outstanding: 0, avgRating: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single()
      if (profile) setUserName(profile.first_name)

      // Get pro stats
      const { data: proProfile } = await supabase.from('pro_profiles').select('avg_rating, total_jobs').eq('id', user.id).single()

      // Get today's jobs
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

      const { data: todayData } = await supabase.from('jobs')
        .select('*').eq('pro_id', user.id)
        .gte('scheduled_at', todayStart).lt('scheduled_at', todayEnd)
        .order('scheduled_at', { ascending: true })

      // Get upcoming jobs (next 7 days, not today)
      const { data: upcomingData } = await supabase.from('jobs')
        .select('*').eq('pro_id', user.id)
        .gte('scheduled_at', todayEnd)
        .lt('scheduled_at', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_at', { ascending: true }).limit(3)

      // Get earnings today
      const { data: paidToday } = await supabase.from('invoices')
        .select('amount').eq('pro_id', user.id).eq('status', 'paid')
        .gte('paid_at', todayStart).lt('paid_at', todayEnd)

      // Get outstanding
      const { data: outstanding } = await supabase.from('invoices')
        .select('amount').eq('pro_id', user.id).eq('status', 'sent')

      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: weekJobs } = await supabase.from('jobs')
        .select('*', { count: 'exact', head: true }).eq('pro_id', user.id)
        .gte('scheduled_at', weekStart)

      setTodayJobs(todayData || [])
      setUpcomingJobs(upcomingData || [])
      setStats({
        earningsToday: paidToday?.reduce((s, i) => s + i.amount, 0) || 0,
        jobsThisWeek: weekJobs || 0,
        outstanding: outstanding?.reduce((s, i) => s + i.amount, 0) || 0,
        avgRating: proProfile?.avg_rating || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">{greeting(lang)}</p>
          <h1 className="font-display text-4xl tracking-wider text-white">{userName || t('welcome_back')}</h1>
          <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/jobs/new"
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-display text-lg tracking-widest hover:bg-yellow-300 transition-colors no-underline">
          <Plus size={16}/>{t('add_job')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: t('earnings_today'), value: `$${stats.earningsToday.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/8' },
          { label: t('jobs_this_week'), value: stats.jobsThisWeek.toString(), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/8' },
          { label: t('outstanding'), value: `$${stats.outstanding.toFixed(2)}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/8' },
          { label: t('avg_rating'), value: stats.avgRating > 0 ? `${stats.avgRating} ★` : '—', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/8' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#0B0F17] border border-white/6 rounded-xl p-4">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={15} className={color}/>
            </div>
            <div className="font-display text-2xl tracking-wider text-white">{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Today's Jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-wider text-white">Today</h2>
          <Link href="/jobs" className="font-mono text-xs text-yellow-400/60 hover:text-yellow-400 transition-colors flex items-center gap-1 no-underline">
            {t('jobs')} <ChevronRight size={12}/>
          </Link>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-8 text-center">
            <Calendar size={28} className="text-white/15 mx-auto mb-3"/>
            <p className="text-white/30 text-sm font-mono">{t('no_jobs_today')}</p>
            <Link href="/jobs/new" className="inline-flex items-center gap-2 mt-4 text-yellow-400 font-mono text-xs hover:text-yellow-300 transition-colors no-underline">
              <Plus size={12}/>{t('add_job')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 hover:border-yellow-400/20 transition-all no-underline group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || STATUS_COLORS.scheduled}`}>
                        {t(job.status).replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[9px] text-white/25">
                        {new Date(job.scheduled_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-white font-medium text-sm truncate group-hover:text-yellow-400 transition-colors">{job.title}</h3>
                    {job.address && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={10} className="text-white/25 flex-shrink-0"/>
                        <span className="font-mono text-[10px] text-white/30 truncate">{job.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {(job.final_amount || job.quoted_amount) && (
                      <div className="font-display text-xl tracking-wider text-green-400">
                        ${(job.final_amount || job.quoted_amount)?.toFixed(2)}
                      </div>
                    )}
                    <ChevronRight size={14} className="text-white/20 mt-1 ml-auto"/>
                  </div>
                </div>
                {/* Quick actions */}
                {(job.status === 'scheduled' || job.status === 'confirmed') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <button className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-yellow-400/20 transition-colors">
                      <Navigation size={10}/>{t('on_my_way')}
                    </button>
                    <button className="flex items-center gap-1.5 bg-white/4 border border-white/8 text-white/50 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-white/8 transition-colors">
                      <Phone size={10}/>{t('customer')}
                    </button>
                    <button className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-green-500/15 transition-colors ml-auto">
                      <CheckCircle2 size={10}/>{t('job_complete')}
                    </button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      {upcomingJobs.length > 0 && (
        <div>
          <h2 className="font-display text-2xl tracking-wider text-white mb-4">Upcoming</h2>
          <div className="flex flex-col gap-2">
            {upcomingJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-all no-underline group flex items-center gap-3">
                <div className="w-10 h-10 bg-[#131C28] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-display text-sm text-yellow-400 leading-none">{new Date(job.scheduled_at).getDate()}</span>
                  <span className="font-mono text-[8px] text-white/30 uppercase">{new Date(job.scheduled_at).toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white/80 text-sm truncate group-hover:text-white transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={9} className="text-white/25"/>
                    <span className="font-mono text-[10px] text-white/25">
                      {new Date(job.scheduled_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/20 flex-shrink-0"/>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
