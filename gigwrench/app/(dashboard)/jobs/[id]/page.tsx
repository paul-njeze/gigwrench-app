'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import GpsConsentModal from '@/components/gps/GpsConsentModal'
import ChatThread from '@/components/messages/ChatThread'
import CustomerLinkCard from '@/components/jobs/CustomerLinkCard'
import {
  ArrowLeft, Clock, MapPin, Navigation, CheckCircle2,
  Calendar, DollarSign, MapPinned, MessageSquare,
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
  pro_id: string | null
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

const ACTIVE = ['scheduled', 'confirmed', 'on_the_way', 'in_progress']

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(iso: string, lang: string): string {
  return new Date(iso).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useLang()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [omwStarting, setOmwStarting] = useState(false)
  const [omwError, setOmwError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMissing(true)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('pro_id', user.id)
        .maybeSingle()
      if (!data) setMissing(true)
      else setJob(data as unknown as Job)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  function proceedOnMyWay() {
    if (!job) return
    setOmwError(null)
    if (!navigator.geolocation) {
      setOmwError(t('gps_required_enable_location'))
      return
    }
    setOmwStarting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            setOmwStarting(false)
            return
          }
          await fetch('/api/gps/on-my-way', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ job_id: job.id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
          })
          setJob((prev) => (prev ? { ...prev, status: 'on_the_way' } : prev))
          window.dispatchEvent(new Event('gw:omw-started'))
        } finally {
          setOmwStarting(false)
        }
      },
      () => {
        setOmwStarting(false)
        setOmwError(t('gps_required_enable_location'))
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleOnMyWay() {
    if (!job) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase
      .from('profiles')
      .select('gps_consent_given')
      .eq('id', user.id)
      .maybeSingle()
    if (prof && (prof as { gps_consent_given?: boolean }).gps_consent_given) proceedOnMyWay()
    else setConsentOpen(true)
  }

  async function acceptConsent() {
    setConsentOpen(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ gps_consent_given: true, gps_consent_at: new Date().toISOString() })
      .eq('id', user.id)
    proceedOnMyWay()
  }

  async function completeJob() {
    if (!job || completing) return
    setCompleting(true)
    try {
      await fetch('/api/loyalty/job-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id }),
      })
      setJob((prev) => (prev ? { ...prev, status: 'completed' } : prev))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (missing || !job) {
    return (
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-6">
          <ArrowLeft size={14} />{t('jobs')}
        </Link>
        <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-12 text-center">
          <Calendar size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm font-mono">This job could not be found.</p>
        </div>
      </div>
    )
  }

  const amount = job.final_amount ?? job.quoted_amount
  const showActive = ACTIVE.includes(job.status)

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-6">
        <ArrowLeft size={14} />{t('jobs')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || STATUS_COLORS.scheduled}`}>
                {t(job.status).replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-display text-3xl tracking-wider text-white leading-tight">{job.title}</h1>

            <div className="flex flex-col gap-2.5 mt-4">
              <div className="flex items-center gap-2 text-white/55">
                <Calendar size={13} className="text-white/30 flex-shrink-0" />
                <span className="font-mono text-xs">{formatDate(job.scheduled_at, lang)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/55">
                <Clock size={13} className="text-white/30 flex-shrink-0" />
                <span className="font-mono text-xs">{formatTime(job.scheduled_at, lang)}</span>
              </div>
              {job.address && (
                <div className="flex items-start gap-2 text-white/55">
                  <MapPin size={13} className="text-white/30 flex-shrink-0 mt-0.5" />
                  <span className="font-mono text-xs">{job.address}</span>
                </div>
              )}
              {amount != null && (
                <div className="flex items-center gap-2">
                  <DollarSign size={13} className="text-green-400/60 flex-shrink-0" />
                  <span className="font-display text-2xl tracking-wider text-green-400">${amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {job.description && (
              <p className="text-white/45 text-sm leading-relaxed mt-4 pt-4 border-t border-white/6 whitespace-pre-wrap">{job.description}</p>
            )}
          </div>

          <CustomerLinkCard
            jobId={job.id}
            initialCustomerId={job.customer_id}
            onChange={(cid) => setJob((prev) => (prev ? { ...prev, customer_id: cid } : prev))}
          />

          <div className="flex flex-col gap-2">
            {showActive && (
              <button
                onClick={handleOnMyWay}
                disabled={omwStarting}
                className="flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-yellow-400/20 transition-colors disabled:opacity-50"
              >
                <Navigation size={13} />{omwStarting ? t('on_my_way_starting') : t('on_my_way')}
              </button>
            )}
            <Link
              href={`/track/${job.id}`}
              className="flex items-center justify-center gap-2 bg-white/4 border border-white/8 text-white/70 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-white/8 transition-colors no-underline"
            >
              <MapPinned size={13} />Live tracker
            </Link>
            {showActive && (
              <button
                onClick={completeJob}
                disabled={completing}
                className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-green-500/15 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={13} />{completing ? '...' : t('job_complete')}
              </button>
            )}
          </div>

          {omwError && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg font-mono text-[11px] text-center">
              {omwError}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <MessageSquare size={13} className="text-white/30" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Messages</span>
          </div>
          <div className="rounded-xl border border-white/8 overflow-hidden h-[70vh] lg:h-[calc(100vh-13rem)]">
            <ChatThread jobId={job.id} />
          </div>
        </div>
      </div>

      <GpsConsentModal
        open={consentOpen}
        title={t('gps_consent_title')}
        body={t('gps_consent_body')}
        acceptLabel={t('gps_consent_accept')}
        declineLabel={t('gps_consent_decline')}
        onAccept={acceptConsent}
        onDecline={() => setConsentOpen(false)}
      />
    </div>
  )
}
