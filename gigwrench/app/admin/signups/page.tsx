'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Search } from 'lucide-react'

interface Signup {
  id: string
  email: string
  name: string
  role: string
  confirmed: boolean
  onboarded: boolean
  has_profile: boolean
  account_status: string
  created_at: string
  last_sign_in_at: string | null
}

const FILTERS = ['all', 'pro', 'customer', 'unconfirmed', 'not onboarded']

export default function AdminSignups() {
  const [rows, setRows] = useState<Signup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setError('Session expired.'); setLoading(false); return }
        const res = await fetch('/api/admin/signups', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const out = await res.json()
        if (!res.ok) { setError(out.error || 'Failed to load.'); setLoading(false); return }
        setRows(out.signups as Signup[])
      } catch {
        setError('Failed to load.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r => {
      if (filter === 'pro' && r.role !== 'pro') return false
      if (filter === 'customer' && r.role !== 'customer') return false
      if (filter === 'unconfirmed' && r.confirmed) return false
      if (filter === 'not onboarded' && r.onboarded) return false
      if (!q) return true
      return r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    })
  }, [rows, search, filter])

  function exportCsv() {
    const headers = ['email', 'name', 'role', 'confirmed', 'onboarded', 'account_status', 'created_at', 'last_sign_in_at']
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [headers.join(',')]
    for (const r of filtered) {
      lines.push([r.email, r.name, r.role, r.confirmed, r.onboarded, r.account_status, r.created_at, r.last_sign_in_at].map(escape).join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gigwrench-signups-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl tracking-wide">Sign ups</h1>
        <button onClick={exportCsv} disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-400 text-black font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-yellow-300 disabled:opacity-40">
          <Download size={12} /> Export CSV
        </button>
      </div>
      <p className="text-white/40 text-sm mb-5">{rows.length} total registrations, including accounts that never finished onboarding.</p>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email"
          className="w-full bg-[#0B0F17] border border-white/8 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-yellow-400/30 outline-none" />
      </div>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${filter === f ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm font-mono">Loading sign ups.</p>
      ) : error ? (
        <p className="text-red-400/80 text-sm font-mono">{error}</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-lg bg-[#0B0F17] border border-white/8">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{r.name || 'Unnamed'}</p>
                <p className="text-white/35 text-xs truncate">{r.email}</p>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 hidden sm:inline">{r.role || 'unknown'}</span>
              {!r.confirmed && <span className="font-mono text-[9px] uppercase tracking-widest text-red-400/70">Unconfirmed</span>}
              {r.confirmed && !r.onboarded && <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400/70">No onboarding</span>}
              <span className="font-mono text-[9px] text-white/25">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-white/30 text-sm font-mono">No sign ups match.</p>}
        </div>
      )}
    </div>
  )
}
