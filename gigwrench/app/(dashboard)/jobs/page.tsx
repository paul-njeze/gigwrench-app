'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useLang } from '@/lib/lang'

import Link from 'next/link'
import GpsConsentModal from '@/components/gps/GpsConsentModal'

import {

  Plus, Search, Filter, ChevronRight, Clock, MapPin,

  CheckCircle2, Navigation, Phone, DollarSign, Calendar, X

} from 'lucide-react'

interface Job {

  id: string

  title: string

  scheduled_at: string

  address: string | null

  status: string

  final_amount: number | null

  quoted_amount: number | null

  customer_id: string | null

  description: string | null

}

const STATUS_COLORS: Record<string, string> = {

  scheduled:   'bg-blue-500/15 text-blue-400 border-blue-500/25',

  confirmed:   'bg-green-500/15 text-green-400 border-green-500/25',

  on_the_way:  'bg-yellow-400/15 text-yellow-400 border-yellow-400/25',

  in_progress: 'bg-orange-500/15 text-orange-400 border-orange-500/25',

  completed:   'bg-green-500/15 text-green-400 border-green-500/25',

  invoiced:    'bg-purple-500/15 text-purple-400 border-purple-500/25',

  paid:        'bg-green-500/15 text-green-400 border-green-500/25',

  cancelled:   'bg-red-500/15 text-red-400 border-red-500/25',

}

const ALL_STATUSES = ['scheduled','confirmed','on_the_way','in_progress','completed','invoiced','paid','cancelled']

function formatDate(iso: string, lang: string): string {

  return new Date(iso).toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' })

}

function formatTime(iso: string, lang: string): string {

  return new Date(iso).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })

}

export default function JobsPage() {

  const { t, lang } = useLang()

  const [jobs, setJobs] = useState<Job[]>([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [showFilter, setShowFilter] = useState(false)

  const [consentJob, setConsentJob] = useState<Job | null>(null)

  const [omwError, setOmwError] = useState<string | null>(null)

  const [omwStartingId, setOmwStartingId] = useState<string | null>(null)

  function proceedOnMyWay(job: Job) {
    setOmwError(null)
    if (!navigator.geolocation) {
      setOmwError(t('gps_required_enable_location'))
      return
    }
    setOmwStartingId(job.id)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) { setOmwStartingId(null); return }
          await fetch('/api/gps/on-my-way', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ job_id: job.id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
          })
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'on_the_way' } : j))
          window.dispatchEvent(new Event('gw:omw-started'))
        } finally {
          setOmwStartingId(null)
        }
      },
      () => {
        setOmwStartingId(null)
        setOmwError(t('gps_required_enable_location'))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleOnMyWay(job: Job) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase
      .from('profiles')
      .select('gps_consent_given')
      .eq('id', user.id)
      .maybeSingle()
    if (prof && prof.gps_consent_given) {
      proceedOnMyWay(job)
    } else {
      setConsentJob(job)
    }
  }

  async function acceptConsent() {
    const job = consentJob
    setConsentJob(null)
    if (!job) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ gps_consent_given: true, gps_consent_at: new Date().toISOString() })
      .eq('id', user.id)
    proceedOnMyWay(job)
  }

  useEffect(() => {

    async function load() {

      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase

        .from('jobs')

        .select('*')

        .eq('pro_id', user.id)

        .order('scheduled_at', { ascending: false })

      setJobs(data || [])

      setLoading(false)

    }

    load()

  }, [])

  const filtered = jobs.filter(j => {

    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || (j.address || '').toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || j.status === statusFilter

    return matchSearch && matchStatus

  })

  const grouped: Record<string, Job[]> = {}

  filtered.forEach(j => {

    const day = new Date(j.scheduled_at).toDateString()

    if (!grouped[day]) grouped[day] = []

    grouped[day].push(j)

  })

  if (loading) return (

    <div className="flex items-center justify-center h-64">

      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>

    </div>

  )

  return (

    <div className="px-6 py-6 max-w-5xl mx-auto">

      <div className="flex items-start justify-between mb-6">

        <div>

          <h1 className="font-display text-4xl tracking-wider text-white">{t('jobs')}</h1>

          <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-widest">{filtered.length} job{filtered.length !== 1 ? 's' : ''}</p>

        </div>

        <Link href="/jobs/new"

          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-display text-lg tracking-widest hover:bg-yellow-300 transition-colors no-underline">

          <Plus size={16}/>{t('add_job')}

        </Link>

      </div>

      <div className="flex gap-2 mb-6">

        <div className="relative flex-1">

          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>

          <input

            type="text"

            value={search}

            onChange={e => setSearch(e.target.value)}

            placeholder={t('search') + '...'}

            className="w-full bg-[#0B0F17] border border-white/6 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/30 transition-colors placeholder:text-white/20 font-mono"

          />

          {search && (

            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">

              <X size={12}/>

            </button>

          )}

        </div>

        <button onClick={() => setShowFilter(!showFilter)}

          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-mono transition-all ${showFilter || statusFilter !== 'all' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-[#0B0F17] border-white/6 text-white/40 hover:border-white/15 hover:text-white/60'}`}>

          <Filter size={14}/>

          {statusFilter !== 'all' ? statusFilter.replace('_', ' ') : 'Filter'}

        </button>

      </div>

      {showFilter && (

        <div className="flex flex-wrap gap-2 mb-5">

          {['all', ...ALL_STATUSES].map(s => (

            <button key={s} onClick={() => { setStatusFilter(s); setShowFilter(false) }}

              className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${statusFilter === s ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'}`}>

              {s === 'all' ? 'All statuses' : s.replace('_', ' ')}

            </button>

          ))}

        </div>

      )}

      {filtered.length === 0 ? (

        <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-12 text-center">

          <Calendar size={32} className="text-white/15 mx-auto mb-3"/>

          <p className="text-white/30 text-sm font-mono">{search || statusFilter !== 'all' ? 'No jobs match your filters.' : t('no_jobs_today')}</p>

          {!search && statusFilter === 'all' && (

            <Link href="/jobs/new" className="inline-flex items-center gap-2 mt-4 text-yellow-400 font-mono text-xs hover:text-yellow-300 transition-colors no-underline">

              <Plus size={12}/>{t('add_job')}

            </Link>

          )}

        </div>

      ) : (

        <div className="flex flex-col gap-6">

          {Object.entries(grouped).map(([day, dayJobs]) => (

            <div key={day}>

              <div className="flex items-center gap-3 mb-2">

                <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">

                  {new Date(day).toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' })}

                </span>

                <div className="flex-1 h-px bg-white/5"/>

                <span className="font-mono text-[10px] text-white/20">{dayJobs.length}</span>

              </div>

              <div className="flex flex-col gap-2">

                {dayJobs.map(job => (

                  <Link key={job.id} href={`/jobs/${job.id}`}

                    className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 hover:border-yellow-400/20 transition-all no-underline group">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2 mb-2 flex-wrap">

                          <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || STATUS_COLORS.scheduled}`}>

                            {t(job.status)}

                          </span>

                          <span className="font-mono text-[9px] text-white/25 flex items-center gap-1">

                            <Clock size={9}/>{formatTime(job.scheduled_at, lang)}

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

                    {(job.status === 'scheduled' || job.status === 'confirmed') && (

                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">

                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleOnMyWay(job) }} disabled={omwStartingId === job.id} className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-yellow-400/20 transition-colors disabled:opacity-50">

                          <Navigation size={10}/>{omwStartingId === job.id ? t('on_my_way_starting') : t('on_my_way')}

                        </button>

                        <button onClick={e => e.preventDefault()} className="flex items-center gap-1.5 bg-white/4 border border-white/8 text-white/50 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-white/8 transition-colors">

                          <Phone size={10}/>{t('customer')}

                        </button>

                        <button onClick={async e => {
          e.preventDefault()
          e.stopPropagation()
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          await fetch('/api/loyalty/job-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id: job.id }),
          })
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed' } : j))
        }} className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-green-500/15 transition-colors ml-auto">

                          <CheckCircle2 size={10}/>{t('job_complete')}

                        </button>

                      </div>

                    )}

                  </Link>
                ))}

              </div>

            </div>

          ))}

        </div>

      )}

      <GpsConsentModal
        open={!!consentJob}
        title={t('gps_consent_title')}
        body={t('gps_consent_body')}
        acceptLabel={t('gps_consent_accept')}
        declineLabel={t('gps_consent_decline')}
        onAccept={acceptConsent}
        onDecline={() => setConsentJob(null)}
      />

      {omwError && (

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg font-mono text-[11px] max-w-sm text-center">

          {omwError}

        </div>

      )}

    </div>

  )

}
