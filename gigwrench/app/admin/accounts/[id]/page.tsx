'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ShieldAlert, Ban, RotateCcw, Search as SearchIcon } from 'lucide-react'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  role: string | null
  account_status: string | null
  status_reason: string | null
  suspended_until: string | null
  created_at: string
}

interface Investigation {
  id: string
  status: string
  reason: string | null
  opened_at: string
}

interface AuditEntry {
  id: string
  action: string
  created_at: string
  details: Record<string, unknown> | null
}

const PRESETS: { value: string; label: string }[] = [
  { value: '1w', label: '1 week' }, { value: '2w', label: '2 weeks' },
  { value: '3w', label: '3 weeks' }, { value: '4w', label: '4 weeks' },
  { value: '1m', label: '1 month' }, { value: '2m', label: '2 months' },
  { value: '3m', label: '3 months' }, { value: '4m', label: '4 months' },
  { value: '5m', label: '5 months' }, { value: '6m', label: '6 months' },
  { value: 'indefinite', label: 'Indefinite' }, { value: 'custom', label: 'Custom date' },
]

function computeUntil(preset: string, custom: string): string | null {
  if (preset === 'indefinite') return null
  if (preset === 'custom') return custom ? new Date(custom + 'T12:00:00').toISOString() : null
  const d = new Date()
  if (preset.endsWith('w')) d.setDate(d.getDate() + parseInt(preset) * 7)
  else if (preset.endsWith('m')) d.setMonth(d.getMonth() + parseInt(preset))
  return d.toISOString()
}

const BADGE: Record<string, string> = {
  active: 'bg-green-500/10 border-green-500/20 text-green-400',
  warned: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
  suspended: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  disabled: 'bg-red-500/10 border-red-500/20 text-red-400',
}

export default function AccountDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [reason, setReason] = useState('')
  const [preset, setPreset] = useState('1w')
  const [customDate, setCustomDate] = useState('')
  const [resolution, setResolution] = useState<'cleared' | 'warning' | 'suspended' | 'disabled'>('cleared')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: p } = await supabase.from('profiles')
      .select('id,first_name,last_name,email,phone,role,account_status,status_reason,suspended_until,created_at')
      .eq('id', id).single()
    setProfile(p as Profile)
    const { data: inv } = await supabase.from('investigations')
      .select('id,status,reason,opened_at').eq('profile_id', id).eq('status', 'open')
      .order('opened_at', { ascending: false }).limit(1).maybeSingle()
    setInvestigation(inv as Investigation | null)
    const { data: a } = await supabase.from('audit_log')
      .select('id,action,created_at,details').eq('target_id', id)
      .order('created_at', { ascending: false }).limit(12)
    setAudit((a as AuditEntry[]) || [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function call(path: string, payload: Record<string, unknown>) {
    setBusy(true); setMsg(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setMsg('Session expired.'); setBusy(false); return }
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      })
      const out = await res.json()
      if (!res.ok) { setMsg(out.error || 'Action failed.'); setBusy(false); return }
      setReason('')
      await load()
      setMsg('Done.')
    } catch {
      setMsg('Action failed.')
    }
    setBusy(false)
  }

  if (loading) return <p className="text-white/30 text-sm font-mono">Loading account.</p>
  if (!profile) return <p className="text-white/30 text-sm font-mono">Account not found.</p>

  const status = profile.account_status || 'active'
  const name = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Unnamed'

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push('/admin/accounts')}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-4">
        <ArrowLeft size={12} /> Accounts
      </button>

      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-2xl tracking-wide">{name}</h1>
        <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${BADGE[status] || BADGE.active}`}>{status}</span>
      </div>
      <p className="text-white/40 text-sm">{profile.email} {profile.phone ? `. ${profile.phone}` : ''}</p>
      <p className="text-white/30 text-xs font-mono mt-1">Role {profile.role || 'user'}</p>
      {status === 'suspended' && (
        <p className="text-orange-400/80 text-xs font-mono mt-2">
          Suspended until {profile.suspended_until ? new Date(profile.suspended_until).toLocaleDateString() : 'further notice'}
        </p>
      )}
      {profile.status_reason && <p className="text-white/35 text-xs mt-1">Reason: {profile.status_reason}</p>}

      {msg && <p className="mt-3 font-mono text-[11px] text-yellow-400">{msg}</p>}

      <div className="mt-6 p-4 rounded-xl bg-[#0B0F17] border border-white/8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">Reason (shown to user where relevant)</p>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional note"
          className="w-full bg-[#07090D] border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-yellow-400/30 outline-none mb-4" />

        <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Suspension length</p>
        <div className="flex gap-2 mb-2">
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="flex-1 bg-[#07090D] border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30">
            {PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {preset === 'custom' && (
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
              className="bg-[#07090D] border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button disabled={busy} onClick={() => call('/api/admin/account-action', { target_id: id, action: 'warn', reason })}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-[10px] uppercase tracking-widest hover:bg-yellow-400/20 disabled:opacity-40">
            <ShieldAlert size={12} /> Warn
          </button>
          <button disabled={busy} onClick={() => call('/api/admin/account-action', { target_id: id, action: 'suspend', reason, suspended_until: computeUntil(preset, customDate) })}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[10px] uppercase tracking-widest hover:bg-orange-500/20 disabled:opacity-40">
            Suspend
          </button>
          <button disabled={busy} onClick={() => call('/api/admin/account-action', { target_id: id, action: 'disable', reason })}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-40">
            <Ban size={12} /> Disable
          </button>
          <button disabled={busy} onClick={() => call('/api/admin/account-action', { target_id: id, action: 'restore' })}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[10px] uppercase tracking-widest hover:bg-green-500/20 disabled:opacity-40">
            <RotateCcw size={12} /> Restore
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-[#0B0F17] border border-white/8">
        <div className="flex items-center gap-2 mb-3">
          <SearchIcon size={13} className="text-white/40" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Investigation</p>
        </div>
        {investigation ? (
          <div>
            <p className="text-white/40 text-xs mb-3">Open since {new Date(investigation.opened_at).toLocaleDateString()}{investigation.reason ? `. ${investigation.reason}` : ''}</p>
            <div className="flex gap-2 mb-2">
              <select value={resolution} onChange={e => setResolution(e.target.value as typeof resolution)}
                className="flex-1 bg-[#07090D] border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30">
                <option value="cleared">Cleared</option>
                <option value="warning">Warning</option>
                <option value="suspended">Suspended</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <button disabled={busy}
              onClick={() => call('/api/admin/investigation', { op: 'close', investigation_id: investigation.id, target_id: id, resolution, reason, suspended_until: resolution === 'suspended' ? computeUntil(preset, customDate) : null })}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-40">
              Close with decision
            </button>
          </div>
        ) : (
          <button disabled={busy} onClick={() => call('/api/admin/investigation', { op: 'open', target_id: id, reason })}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-40">
            Open investigation
          </button>
        )}
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Recent activity</p>
        {audit.length === 0 ? (
          <p className="text-white/25 text-xs font-mono">No recorded actions.</p>
        ) : (
          <div className="space-y-1">
            {audit.map(e => (
              <div key={e.id} className="flex items-center gap-3 text-xs">
                <span className="font-mono text-white/50">{e.action.replace(/_/g, ' ')}</span>
                <span className="text-white/25 ml-auto font-mono">{new Date(e.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
