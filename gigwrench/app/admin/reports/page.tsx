'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Flag, ExternalLink } from 'lucide-react'

interface Report {
  id: string
  reason: string | null
  details: string | null
  status: string
  created_at: string
  reported_id: string
  reporter_id: string | null
  reported: { first_name: string | null; last_name: string | null; email: string | null } | null
  reporter: { first_name: string | null; last_name: string | null } | null
}

const FILTERS = ['open', 'reviewing', 'resolved', 'dismissed', 'all']

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reports')
      .select('id,reason,details,status,created_at,reported_id,reporter_id,reported:profiles!reports_reported_id_fkey(first_name,last_name,email),reporter:profiles!reports_reporter_id_fkey(first_name,last_name)')
      .order('created_at', { ascending: false })
    setReports((data as unknown as Report[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function setStatus(id: string, status: string) {
    setBusy(id)
    const supabase = createClient()
    await supabase.from('reports').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
    await load()
    setBusy(null)
  }

  async function openInvestigation(r: Report) {
    setBusy(r.id)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetch('/api/admin/investigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ op: 'open', target_id: r.reported_id, reason: r.reason || 'Reported by user' }),
      })
      await supabase.from('reports').update({ status: 'reviewing', reviewed_at: new Date().toISOString() }).eq('id', r.id)
    }
    await load()
    setBusy(null)
  }

  const shown = reports.filter(r => filter === 'all' || r.status === filter)

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide mb-1">Reports</h1>
      <p className="text-white/40 text-sm mb-5">User reports. Open an investigation to act, which notifies the reported account.</p>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${filter === f ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm font-mono">Loading reports.</p>
      ) : shown.length === 0 ? (
        <p className="text-white/30 text-sm font-mono">No reports here.</p>
      ) : (
        <div className="space-y-2">
          {shown.map(r => {
            const reported = `${r.reported?.first_name ?? ''} ${r.reported?.last_name ?? ''}`.trim() || r.reported?.email || 'Unknown'
            const reporter = `${r.reporter?.first_name ?? ''} ${r.reporter?.last_name ?? ''}`.trim() || 'A user'
            return (
              <div key={r.id} className="p-4 rounded-xl bg-[#0B0F17] border border-white/8">
                <div className="flex items-start gap-2 mb-2">
                  <Flag size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{reported} <span className="text-white/30 font-mono text-[10px] uppercase tracking-widest ml-1">{r.status}</span></p>
                    <p className="text-white/40 text-xs">Reported by {reporter} . {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/admin/accounts/${r.reported_id}`} className="text-white/30 hover:text-white"><ExternalLink size={14} /></Link>
                </div>
                {r.reason && <p className="text-white/60 text-sm mb-1">{r.reason}</p>}
                {r.details && <p className="text-white/40 text-xs mb-3">{r.details}</p>}
                <div className="flex gap-2 flex-wrap">
                  <button disabled={busy === r.id} onClick={() => openInvestigation(r)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-[10px] uppercase tracking-widest hover:bg-yellow-400/20 disabled:opacity-40">
                    Open investigation
                  </button>
                  <button disabled={busy === r.id} onClick={() => setStatus(r.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-40">
                    Mark resolved
                  </button>
                  <button disabled={busy === r.id} onClick={() => setStatus(r.id, 'dismissed')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-40">
                    Dismiss
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
