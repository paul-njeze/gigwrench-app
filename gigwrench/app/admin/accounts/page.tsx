'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, ChevronRight } from 'lucide-react'

interface Account {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string | null
  account_status: string | null
  suspended_until: string | null
  created_at: string
}

const STATUSES = ['all', 'active', 'warned', 'suspended', 'disabled']

const BADGE: Record<string, string> = {
  active: 'bg-green-500/10 border-green-500/20 text-green-400',
  warned: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
  suspended: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  disabled: 'bg-red-500/10 border-red-500/20 text-red-400',
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,email,role,account_status,suspended_until,created_at')
        .order('created_at', { ascending: false })
      setAccounts((data as Account[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return accounts.filter(a => {
      const status = a.account_status || 'active'
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (!q) return true
      const name = `${a.first_name ?? ''} ${a.last_name ?? ''}`.toLowerCase()
      return name.includes(q) || (a.email ?? '').toLowerCase().includes(q)
    })
  }, [accounts, search, statusFilter])

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide mb-1">Accounts</h1>
      <p className="text-white/40 text-sm mb-5">{accounts.length} total accounts.</p>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full bg-[#0B0F17] border border-white/8 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-yellow-400/30 outline-none"
        />
      </div>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${statusFilter === s ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/30 text-sm font-mono">Loading accounts.</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/30 text-sm font-mono">No accounts match.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(a => {
            const status = a.account_status || 'active'
            return (
              <Link key={a.id} href={`/admin/accounts/${a.id}`}
                className="flex items-center gap-3 p-3.5 rounded-lg bg-[#0B0F17] border border-white/8 hover:border-yellow-400/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{`${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || 'Unnamed'}</p>
                  <p className="text-white/35 text-xs truncate">{a.email || 'No email'}</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">{a.role || 'user'}</span>
                <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${BADGE[status] || BADGE.active}`}>
                  {status}
                </span>
                <ChevronRight size={15} className="text-white/20 flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
