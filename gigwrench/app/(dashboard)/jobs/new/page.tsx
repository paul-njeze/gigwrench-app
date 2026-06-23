'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CATEGORY_SUGGESTIONS = [
  'Plumbing', 'Electrical', 'HVAC', 'Appliance Repair', 'Carpentry',
  'Painting', 'Landscaping', 'Cleaning', 'Locksmith', 'General',
]

export default function NewJobPage() {
  const router = useRouter()
  const { t } = useLang()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [quoted, setQuoted] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')

    const cleanTitle = title.trim()
    if (!cleanTitle) { setError(t('jn_err_title')); return }
    if (!date || !time) { setError(t('jn_err_datetime')); return }

    const scheduledAt = new Date(`${date}T${time}`)
    if (isNaN(scheduledAt.getTime())) { setError(t('jn_err_datetime_invalid')); return }

    const durationMinutes = parseInt(duration, 10)
    const quotedAmount = quoted.trim() ? parseFloat(quoted) : null
    if (quoted.trim() && (quotedAmount === null || isNaN(quotedAmount))) {
      setError(t('jn_err_amount')); return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError(t('jn_err_signed_out')); setSaving(false); return }

      const { data: job, error: insertErr } = await supabase
        .from('jobs')
        .insert({
          pro_id: user.id,
          title: cleanTitle,
          category: category.trim() || null,
          description: description.trim() || null,
          address: address.trim() || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: isNaN(durationMinutes) ? 60 : durationMinutes,
          quoted_amount: quotedAmount,
          internal_notes: notes.trim() || null,
          status: 'scheduled',
          currency: 'USD',
        })
        .select('id')
        .single()

      if (insertErr || !job) {
        setError(insertErr?.message || t('jn_err_create_failed'))
        setSaving(false)
        return
      }

      router.push(`/jobs/${job.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('jn_err_generic'))
      setSaving(false)
    }
  }

  const labelClass = 'font-mono text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block'
  const inputClass = 'w-full bg-[#07090D] border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-yellow-400/30 transition-colors placeholder:text-white/20'

  return (
    <div className="min-h-screen bg-[#07090D] px-4 py-10 md:px-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/jobs"
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest mb-8 no-underline">
          <ArrowLeft size={14} /> {t('jn_back_to_jobs')}
        </Link>

        <h1 className="font-display text-4xl tracking-wider text-white mb-2">{t('jn_heading')}</h1>
        <p className="text-white/40 text-sm mb-8">{t('jn_subhead')}</p>

        <div className="flex flex-col gap-4">
          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">{t('jn_section_job')}</p>

            <div className="mb-4">
              <label className={labelClass}>{t('jn_title')}</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={t('jn_title_ph')}
                className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>{t('jn_category')}</label>
                <input value={category} onChange={e => setCategory(e.target.value)}
                  list="job-categories" placeholder={t('jn_optional')} className={inputClass} />
                <datalist id="job-categories">
                  {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>{t('jn_quoted')}</label>
                <input value={quoted} onChange={e => setQuoted(e.target.value)}
                  inputMode="decimal" placeholder={t('jn_optional')} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('jn_description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder={t('jn_description_ph')}
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">{t('jn_section_schedule')}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>{t('jn_date')}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`} />
              </div>
              <div>
                <label className={labelClass}>{t('jn_time')}</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('jn_duration')}</label>
              <input value={duration} onChange={e => setDuration(e.target.value)}
                inputMode="numeric" placeholder="60" className={inputClass} />
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">{t('jn_section_location')}</p>

            <div className="mb-4">
              <label className={labelClass}>{t('jn_address')}</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder={t('jn_address_ph')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>{t('jn_internal_notes')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} placeholder={t('jn_notes_ph')}
                className={`${inputClass} resize-none`} />
              <p className="text-white/25 text-[11px] mt-1.5 leading-relaxed">
                {t('jn_notes_hint')}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-display text-lg tracking-widest hover:bg-yellow-300 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? t('jn_saving') : t('jn_create')}
            </button>
            <Link href="/jobs"
              className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors no-underline">
              {t('cancel')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
