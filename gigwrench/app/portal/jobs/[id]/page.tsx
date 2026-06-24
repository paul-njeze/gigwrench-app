// FILE: app/portal/jobs/[id]/page.tsx  (commit via GitHub Contents API, Rule 19, not the Chrome agent)
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Wrench, MapPinned, Star, CheckCircle2 } from 'lucide-react'

interface PortalJobDetail {
  id: string
  title: string
  scheduled_at: string
  address: string | null
  status: string
  description: string | null
  currency: string | null
  quoted_amount: number | null
  final_amount: number | null
  pro_id: string | null
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
const DONE = ['completed', 'invoiced', 'paid']

function money(amount: number | null, currency: string | null, lang: string): string {
  if (amount == null) return ''
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

export default function PortalJobDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useLang()
  const [job, setJob] = useState<PortalJobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMissing(true); setLoading(false); return }
      const { data } = await supabase.from('jobs')
        .select('id, title, scheduled_at, address, status, description, currency, quoted_amount, final_amount, pro_id, pro:pro_profiles(business_name, trading_name)')
        .eq('id', id).eq('customer_id', user.id).maybeSingle()
      if (!data) { setMissing(true); setLoading(false); return }
      const j = data as unknown as PortalJobDetail
      setJob(j)
      // RLS only returns a published review; an existing one means already reviewed.
      const { data: existing } = await supabase.from('reviews').select('id').eq('job_id', j.id).maybeSingle()
      if (existing) setSubmitted(true)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  async function submitReview() {
    if (!job || rating < 1 || submitting) return
    setSubmitting(true)
    setReviewError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }
    const { error } = await supabase.from('reviews').insert({
      job_id: job.id,
      pro_id: job.pro_id,
      customer_id: user.id,
      rating,
      comment: comment.trim() || null,
      original_language: lang,
    })
    setSubmitting(false)
    // Unique violation on job_id means a review already exists; treat as done.
    if (!error || error.code === '23505') setSubmitted(true)
    else setReviewError(error.message)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  if (missing || !job) return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link href="/portal/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-6">
        <ArrowLeft size={14}/>{t('cp_jobs')}
      </Link>
      <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-12 text-center">
        <Calendar size={32} className="text-white/15 mx-auto mb-3"/>
        <p className="text-white/30 text-sm font-mono">{t('cp_not_found')}</p>
      </div>
    </div>
  )

  const amount = money(job.final_amount ?? job.quoted_amount ?? null, job.currency ?? null, lang)
  const proName = job.pro?.business_name || job.pro?.trading_name || ''
  const showTrack = ACTIVE.includes(job.status)
  const showReview = DONE.includes(job.status)

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link href="/portal/jobs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm no-underline mb-6">
        <ArrowLeft size={14}/>{t('cp_jobs')}
      </Link>

      <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || STATUS_COLORS.scheduled}`}>
            {t(job.status).replace(/_/g, ' ')}
          </span>
        </div>
        <h1 className="font-display text-3xl tracking-wider text-white leading-tight">{job.title}</h1>

        {proName && (
          <div className="flex items-center gap-2 mt-3">
            <Wrench size={13} className="text-yellow-400/70 flex-shrink-0"/>
            <span className="font-mono text-xs text-white/55">{proName}</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-4">
          <div className="flex items-center gap-2 text-white/55">
            <Calendar size={13} className="text-white/30 flex-shrink-0"/>
            <span className="font-mono text-xs">{new Date(job.scheduled_at).toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-white/55">
            <Clock size={13} className="text-white/30 flex-shrink-0"/>
            <span className="font-mono text-xs">{new Date(job.scheduled_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {job.address && (
            <div className="flex items-start gap-2 text-white/55">
              <MapPin size={13} className="text-white/30 flex-shrink-0 mt-0.5"/>
              <span className="font-mono text-xs">{job.address}</span>
            </div>
          )}
          {amount && (
            <div className="flex items-center gap-2">
              <DollarSign size={13} className="text-green-400/60 flex-shrink-0"/>
              <span className="font-display text-2xl tracking-wider text-green-400">{amount}</span>
            </div>
          )}
        </div>

        {job.description && (
          <p className="text-white/45 text-sm leading-relaxed mt-4 pt-4 border-t border-white/6 whitespace-pre-wrap">{job.description}</p>
        )}
      </div>

      {showTrack && (
        <Link href={`/track/${job.id}`}
          className="mt-4 flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-yellow-400/20 transition-colors no-underline">
          <MapPinned size={13}/>{t('cp_track_live')}
        </Link>
      )}

      {showReview && (
        <div className="mt-4 bg-[#0B0F17] border border-white/6 rounded-xl p-5">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 py-2 text-green-400">
              <CheckCircle2 size={16}/>
              <span className="font-mono text-xs uppercase tracking-wider">{t('cp_review_thanks')}</span>
            </div>
          ) : (
            <>
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-3">{t('cp_leave_review')}</h2>
              <div className="flex gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110">
                    <Star size={28}
                      fill={n <= (hover || rating) ? 'currentColor' : 'none'}
                      className={n <= (hover || rating) ? 'text-yellow-400' : 'text-white/20'}/>
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder={t('cp_review_ph')} rows={3}
                className="w-full bg-[#07090D] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:border-yellow-400/30 focus:outline-none resize-none mb-3"/>
              {reviewError && (
                <p className="text-red-400 font-mono text-[11px] mb-3">{reviewError}</p>
              )}
              <button onClick={submitReview} disabled={rating < 1 || submitting}
                className="w-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-yellow-400/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? '...' : t('cp_submit_review')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
