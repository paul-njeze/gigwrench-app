'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { UserPlus, X, Search, Loader2, Check, Mail } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string; avatarUrl: string | null }

function fullName(c: Customer): string {
  return `${c.firstName} ${c.lastName}`.trim()
}

function initials(c: Customer): string {
  const a = (c.firstName || '').trim().charAt(0)
  const b = (c.lastName || '').trim().charAt(0)
  return (a + b).toUpperCase() || '?'
}

export default function CustomerLinkCard({
  jobId,
  initialCustomerId,
  onChange,
}: {
  jobId: string
  initialCustomerId: string | null
  onChange?: (customerId: string | null) => void
}) {
  const { t } = useLang()
  const supabase = useRef(createClient()).current
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [linkingId, setLinkingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function token(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function call(op: string, extra: Record<string, unknown> = {}) {
    const tok = await token()
    if (!tok) return null
    try {
      const res = await fetch('/api/jobs/customer-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ jobId, op, ...extra }),
      })
      return await res.json()
    } catch {
      return null
    }
  }

  useEffect(() => {
    let cancelled = false
    if (initialCustomerId) {
      call('current').then((d) => {
        if (!cancelled && d?.ok) setCustomer(d.customer)
      })
    }
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCustomerId])

  useEffect(() => {
    if (!open) return
    const term = q.trim()
    if (term.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setSearching(true)
    const h = setTimeout(async () => {
      const d = await call('search', { q: term })
      setResults(d?.ok ? d.results : [])
      setSearched(true)
      setSearching(false)
    }, 300)
    return () => clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, open])

  async function link(c: Customer) {
    setLinkingId(c.id)
    setError('')
    const d = await call('link', { customerId: c.id })
    setLinkingId(null)
    if (d?.ok) {
      setCustomer(d.customer)
      setOpen(false)
      setQ('')
      setResults([])
      setSearched(false)
      onChange?.(d.customer?.id || null)
    } else {
      setError(t('cust_link_failed'))
    }
  }

  async function unlink() {
    const d = await call('unlink')
    if (d?.ok) {
      setCustomer(null)
      onChange?.(null)
    }
  }

  async function sendInvite() {
    const email = inviteEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setInviteStatus('sending')
    const tok = await token()
    if (!tok) {
      setInviteStatus('error')
      return
    }
    try {
      const res = await fetch('/api/jobs/invite-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ jobId, email }),
      })
      const d = await res.json()
      setInviteStatus(d?.ok ? 'sent' : 'error')
    } catch {
      setInviteStatus('error')
    }
  }

  return (
    <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-3">{t('customer')}</p>

      {customer ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {customer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-xs text-white/60">{initials(customer)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white font-medium truncate">{fullName(customer)}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-green-400/70 flex items-center gap-1">
              <Check size={10} /> {t('cust_linked')}
            </div>
          </div>
          <button
            onClick={unlink}
            className="font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-red-300 transition-colors flex-shrink-0"
          >
            {t('cust_unlink')}
          </button>
        </div>
      ) : !open ? (
        !inviteOpen ? (
          <div>
            <p className="text-white/40 text-xs leading-relaxed mb-3">{t('cust_none_hint')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider hover:bg-yellow-400/20 transition-colors"
              >
                <UserPlus size={13} /> {t('cust_link')}
              </button>
              <button
                onClick={() => {
                  setInviteOpen(true)
                  setInviteStatus('idle')
                  setError('')
                }}
                className="flex items-center gap-2 bg-white/4 border border-white/8 text-white/70 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider hover:bg-white/8 transition-colors"
              >
                <Mail size={13} /> {t('cust_invite')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative mb-2">
              <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('cust_invite_ph')}
                className="w-full bg-[#07090D] border border-white/8 rounded-lg pl-8 pr-8 py-2 text-sm text-white outline-none focus:border-yellow-400/30 placeholder:text-white/20"
              />
              <button
                onClick={() => {
                  setInviteOpen(false)
                  setInviteEmail('')
                  setInviteStatus('idle')
                  setError('')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            {inviteStatus === 'sent' ? (
              <p className="px-1 py-2 text-green-400/80 text-xs flex items-center gap-1.5">
                <Check size={12} /> {t('cust_invite_sent')}
              </p>
            ) : (
              <>
                <p className="text-white/30 text-[11px] leading-relaxed mb-2">{t('cust_invite_hint')}</p>
                <button
                  onClick={sendInvite}
                  disabled={inviteStatus === 'sending' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())}
                  className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider hover:bg-yellow-400/20 transition-colors disabled:opacity-40"
                >
                  {inviteStatus === 'sending' ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                  {inviteStatus === 'sending' ? t('cust_invite_sending') : t('cust_invite_send')}
                </button>
              </>
            )}
            {inviteStatus === 'error' && <p className="px-1 py-2 text-red-300 text-xs">{t('cust_invite_failed')}</p>}
          </div>
        )
      ) : (
        <div>
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('cust_search_ph')}
              className="w-full bg-[#07090D] border border-white/8 rounded-lg pl-8 pr-8 py-2 text-sm text-white outline-none focus:border-yellow-400/30 placeholder:text-white/20"
            />
            <button
              onClick={() => {
                setOpen(false)
                setQ('')
                setResults([])
                setSearched(false)
                setError('')
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {searching && (
            <div className="flex items-center gap-2 px-1 py-2 text-white/30 font-mono text-[11px]">
              <Loader2 size={12} className="animate-spin" /> {t('loading')}
            </div>
          )}

          {!searching && searched && results.length === 0 && (
            <p className="px-1 py-2 text-white/25 text-xs">{t('cust_no_results')}</p>
          )}

          {!searching && results.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => link(c)}
                  disabled={linkingId === c.id}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-full bg-white/6 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono text-[10px] text-white/60">{initials(c)}</span>
                    )}
                  </div>
                  <span className="text-sm text-white/80 truncate flex-1">{fullName(c)}</span>
                  {linkingId === c.id ? (
                    <Loader2 size={13} className="animate-spin text-white/40" />
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-yellow-400/70">{t('cust_link')}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {error && <p className="px-1 py-2 text-red-300 text-xs">{error}</p>}
        </div>
      )}
    </div>
  )
}
