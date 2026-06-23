'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowLeft, Inbox, RefreshCw } from 'lucide-react'

interface ThreadSummary {
  jobId: string
  title: string
  status: string
  pro: { id: string; name: string; avatarUrl: string | null } | null
  customer: { id: string; name: string; avatarUrl: string | null } | null
  messageCount: number
  lastMessage: { text: string; at: string; senderName: string } | null
  lastActivityAt: string | null
}

interface DetailMessage {
  id: string
  senderId: string | null
  senderName: string
  senderRole: 'pro' | 'customer' | 'system'
  originalText: string
  originalLanguage: string
  translatedText: string | null
  translatedLanguage: string | null
  messageType: string
  createdAt: string
  readAt: string | null
}

interface ThreadDetail {
  job: { id: string; title: string; status: string; scheduledAt: string | null }
  pro: { id: string; name: string; avatarUrl: string | null; language: string } | null
  customer: { id: string; name: string; avatarUrl: string | null; language: string } | null
  messages: DetailMessage[]
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function statusTone(status: string): string {
  if (status === 'completed' || status === 'paid') return 'text-emerald-400/70'
  if (status === 'cancelled') return 'text-red-400/70'
  if (status === 'on_the_way' || status === 'in_progress') return 'text-yellow-400/80'
  return 'text-white/40'
}

export default function AdminInbox() {
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<ThreadDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  async function token(): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function loadList() {
    setLoading(true)
    setError(null)
    try {
      const t = await token()
      if (!t) { setError('Session expired.'); setLoading(false); return }
      const res = await fetch('/api/admin/threads', { headers: { Authorization: `Bearer ${t}` } })
      const out = await res.json()
      if (!res.ok) { setError(out.error || 'Failed to load.'); setLoading(false); return }
      setThreads(out.threads as ThreadSummary[])
    } catch {
      setError('Failed to load.')
    }
    setLoading(false)
  }

  useEffect(() => { loadList() }, [])

  async function openThread(jobId: string) {
    setSelected(jobId)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      const t = await token()
      if (!t) { setDetailError('Session expired.'); setDetailLoading(false); return }
      const res = await fetch(`/api/admin/threads?jobId=${encodeURIComponent(jobId)}`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      const out = await res.json()
      if (!res.ok) { setDetailError(out.error || 'Failed to load conversation.'); setDetailLoading(false); return }
      setDetail(out as ThreadDetail)
    } catch {
      setDetailError('Failed to load conversation.')
    }
    setDetailLoading(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) => {
      const hay = [t.title, t.pro?.name || '', t.customer?.name || '', t.lastMessage?.text || ''].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [threads, search])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl tracking-wide">Inbox</h1>
        <button onClick={loadList} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/8 text-white/50 font-mono text-[10px] uppercase tracking-widest hover:text-white hover:border-white/20 disabled:opacity-40 transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <p className="text-white/40 text-sm mb-5">Every chat thread across the platform, for support and moderation. Viewing here does not mark messages as read for either party.</p>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4 items-start">
        {/* Thread list */}
        <div className={`${selected ? 'hidden lg:block' : 'block'}`}>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, job, or text"
              className="w-full bg-[#0B0F17] border border-white/8 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-yellow-400/30 outline-none" />
          </div>

          {loading ? (
            <p className="text-white/30 text-sm font-mono">Loading threads.</p>
          ) : error ? (
            <p className="text-red-400/80 text-sm font-mono">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 rounded-xl bg-[#0B0F17] border border-white/8">
              <Inbox size={22} className="text-white/20 mb-2" />
              <p className="text-white/40 text-sm">No threads yet.</p>
              <p className="text-white/25 text-xs mt-1">Conversations appear here once a Pro and a customer exchange a message.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((t) => {
                const active = selected === t.jobId
                return (
                  <button key={t.jobId} onClick={() => openThread(t.jobId)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors ${active ? 'bg-yellow-400/8 border-yellow-400/30' : 'bg-[#0B0F17] border-white/8 hover:border-white/20'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm text-white truncate">{t.title}</p>
                      <span className="font-mono text-[9px] text-white/25 shrink-0">{relativeTime(t.lastActivityAt)}</span>
                    </div>
                    <p className="text-white/40 text-xs truncate mb-1.5">
                      {(t.pro?.name || 'Pro')} <span className="text-white/20">{'<>'}</span> {(t.customer?.name || 'Customer')}
                    </p>
                    {t.lastMessage && (
                      <p className="text-white/35 text-xs truncate">
                        <span className="text-white/50">{t.lastMessage.senderName}:</span> {t.lastMessage.text}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${statusTone(t.status)}`}>{t.status.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-white/25">{t.messageCount} {t.messageCount === 1 ? 'message' : 'messages'}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Reading pane */}
        <div className={`${selected ? 'block' : 'hidden lg:block'}`}>
          {!selected ? (
            <div className="hidden lg:flex flex-col items-center justify-center text-center py-24 rounded-xl bg-[#0B0F17] border border-white/8">
              <Inbox size={24} className="text-white/15 mb-3" />
              <p className="text-white/40 text-sm">Select a thread to read the conversation.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-[#0B0F17] border border-white/8 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
                <button onClick={() => { setSelected(null); setDetail(null) }}
                  className="lg:hidden text-white/50 hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  {detail ? (
                    <>
                      <p className="text-sm text-white truncate">{detail.job.title}</p>
                      <p className="text-white/40 text-xs truncate">
                        {(detail.pro?.name || 'Pro')} <span className="text-white/20">{'<>'}</span> {(detail.customer?.name || 'Customer')}
                        <span className={`ml-2 font-mono text-[9px] uppercase tracking-widest ${statusTone(detail.job.status)}`}>{detail.job.status.replace(/_/g, ' ')}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-white/40 text-sm">Conversation</p>
                  )}
                </div>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {detailLoading ? (
                  <p className="text-white/30 text-sm font-mono">Loading conversation.</p>
                ) : detailError ? (
                  <p className="text-red-400/80 text-sm font-mono">{detailError}</p>
                ) : detail && detail.messages.length === 0 ? (
                  <p className="text-white/30 text-sm font-mono">No messages in this thread.</p>
                ) : detail ? (
                  detail.messages.map((m) => {
                    const isPro = m.senderRole === 'pro'
                    const align = isPro ? 'items-start' : 'items-end'
                    const bubble = isPro ? 'bg-white/[0.04] border-white/8' : 'bg-yellow-400/[0.06] border-yellow-400/15'
                    const roleLabel = m.senderRole === 'pro' ? 'Pro' : m.senderRole === 'customer' ? 'Customer' : 'System'
                    return (
                      <div key={m.id} className={`flex flex-col ${align}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{m.senderName}</span>
                          <span className="font-mono text-[8px] uppercase tracking-widest text-white/25">{roleLabel}</span>
                          <span className="font-mono text-[8px] text-white/20">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className={`max-w-[85%] rounded-xl border px-3.5 py-2.5 ${bubble}`}>
                          <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{m.originalText}</p>
                          {m.translatedText && (
                            <div className="mt-2 pt-2 border-t border-white/8">
                              <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-1">
                                {m.originalLanguage} {'->'} {m.translatedLanguage}
                              </p>
                              <p className="text-xs text-white/55 whitespace-pre-wrap break-words">{m.translatedText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
