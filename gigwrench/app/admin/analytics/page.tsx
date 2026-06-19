'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Briefcase, CheckCircle2, Search } from 'lucide-react'

interface Analytics {
  accounts: { total: number; pros: number; customers: number }
  status: { active: number; warned: number; suspended: number; disabled: number }
  jobs: { total: number; completed: number; byStatus: Record<string, number> }
  investigations: { open: number }
  signupsByDay: { date: string; count: number }[]
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-400', warned: 'bg-yellow-400', suspended: 'bg-orange-400', disabled: 'bg-red-400',
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setError('Session expired.'); setLoading(false); return }
        const res = await fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const out = await res.json()
        if (!res.ok) { setError(out.error || 'Failed to load.'); setLoading(false); return }
        setData(out as Analytics)
      } catch { setError('Failed to load.') }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-white/30 text-sm font-mono">Loading analytics.</p>
  if (error || !data) return <p className="text-red-400/80 text-sm font-mono">{error || 'No data.'}</p>

  const statusTotal = Object.values(data.status).reduce((a, b) => a + b, 0) || 1
  const maxDay = Math.max(1, ...data.signupsByDay.map(d => d.count))

  const Stat = ({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) => (
    <div className="p-4 rounded-xl bg-[#0B0F17] border border-white/8">
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className="text-yellow-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</span></div>
      <p className="font-display text-3xl tracking-wide">{value.toLocaleString()}</p>
    </div>
  )

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide mb-1">Analytics</h1>
      <p className="text-white/40 text-sm mb-5">Onboarded accounts, jobs, and trust signals. Raw registrations live under Sign ups.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat icon={Users} label="Accounts" value={data.accounts.total} />
        <Stat icon={Briefcase} label="Jobs" value={data.jobs.total} />
        <Stat icon={CheckCircle2} label="Completed" value={data.jobs.completed} />
        <Stat icon={Search} label="Open reviews" value={data.investigations.open} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-white/8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Pros vs customers</p>
          <div className="flex items-end gap-4">
            <div><p className="font-display text-2xl text-yellow-400">{data.accounts.pros}</p><p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Pros</p></div>
            <div><p className="font-display text-2xl text-white/80">{data.accounts.customers}</p><p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Customers</p></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-white/8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Account status</p>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-3">
            {(['active', 'warned', 'suspended', 'disabled'] as const).map(s => {
              const v = data.status[s]
              return v > 0 ? <div key={s} className={STATUS_COLOR[s]} style={{ width: `${(v / statusTotal) * 100}%` }} /> : null
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(['active', 'warned', 'suspended', 'disabled'] as const).map(s => (
              <span key={s} className="font-mono text-[10px] text-white/45">
                <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLOR[s]} mr-1.5`} />{s} {data.status[s]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0B0F17] border border-white/8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">New accounts, last 14 days</p>
        <div className="flex items-end gap-1.5 h-28">
          {data.signupsByDay.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div className="w-full bg-yellow-400/70 rounded-t" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }} title={`${d.date}: ${d.count}`} />
              <span className="font-mono text-[8px] text-white/25">{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
