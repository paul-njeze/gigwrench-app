'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CATEGORY_SUGGESTIONS = [
  'Plumbing', 'Electrical', 'HVAC', 'Appliance Repair', 'Carpentry',
  'Painting', 'Landscaping', 'Cleaning', 'Locksmith', 'General',
]

export default function NewJobPage() {
  const router = useRouter()

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
    if (!cleanTitle) { setError('Please add a job title.'); return }
    if (!date || !time) { setError('Please set a date and time.'); return }

    const scheduledAt = new Date(`${date}T${time}`)
    if (isNaN(scheduledAt.getTime())) { setError('That date and time are not valid.'); return }

    const durationMinutes = parseInt(duration, 10)
    const quotedAmount = quoted.trim() ? parseFloat(quoted) : null
    if (quoted.trim() && (quotedAmount === null || isNaN(quotedAmount))) {
      setError('That quoted amount is not a number.'); return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('You are not signed in.'); setSaving(false); return }

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
        setError(insertErr?.message || 'Could not create the job.')
        setSaving(false)
        return
      }

      router.push(`/jobs/${job.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
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
          <ArrowLeft size={14} /> Back to jobs
        </Link>

        <h1 className="font-display text-4xl tracking-wider text-white mb-2">New Job.</h1>
        <p className="text-white/40 text-sm mb-8">Schedule a job and it appears on your jobs board right away.</p>

        <div className="flex flex-col gap-4">
          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">Job</p>

            <div className="mb-4">
              <label className={labelClass}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="AC repair, kitchen sink install, panel upgrade"
                className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>Category</label>
                <input value={category} onChange={e => setCategory(e.target.value)}
                  list="job-categories" placeholder="Optional" className={inputClass} />
                <datalist id="job-categories">
                  {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Quoted amount (USD)</label>
                <input value={quoted} onChange={e => setQuoted(e.target.value)}
                  inputMode="decimal" placeholder="Optional" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="What needs doing"
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">Schedule</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input value={duration} onChange={e => setDuration(e.target.value)}
                inputMode="numeric" placeholder="60" className={inputClass} />
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">Location and notes</p>

            <div className="mb-4">
              <label className={labelClass}>Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Where the work happens" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Internal notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} placeholder="Customer name, phone, gate code, anything only you see"
                className={`${inputClass} resize-none`} />
              <p className="text-white/25 text-[11px] mt-1.5 leading-relaxed">
                Notes are private to you. To enable in app chat and live tracking, link a customer account to this job later.
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
              {saving ? 'Saving' : 'Create job'}
            </button>
            <Link href="/jobs"
              className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors no-underline">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
