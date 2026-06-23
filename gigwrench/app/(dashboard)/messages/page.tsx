'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import ChatThread from '@/components/messages/ChatThread'
import { MessageSquare } from 'lucide-react'

type Thread = {
  jobId: string
  title: string
  status: string
  counterparty: { id: string | null; firstName: string; avatarUrl: string | null }
  lastMessage: { text: string; at: string; fromMe: boolean } | null
  unread: number
  scheduledAt: string | null
}

const AVATAR_COLORS = [
  'bg-yellow-400/20 text-yellow-400',
  'bg-blue-500/20 text-blue-400',
  'bg-green-500/20 text-green-400',
  'bg-purple-500/20 text-purple-400',
  'bg-orange-500/20 text-orange-400',
  'bg-pink-500/20 text-pink-400',
  'bg-teal-500/20 text-teal-400',
  'bg-red-500/20 text-red-400',
]

function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initial(name: string): string {
  return (name.trim().charAt(0) || '?').toUpperCase()
}

function fmtWhen(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), [])
  const { t } = useLang()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  async function token(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  async function loadList() {
    const tok = await token()
    if (!tok) {
      setError(t('msgs_signin_required'))
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${tok}` } })
      const data = await res.json()
      if (data.ok) {
        setThreads(data.threads || [])
        setError('')
      }
    } catch {
      // Keep the last good list on a transient failure.
    }
    setLoading(false)
  }

  useEffect(() => {
    loadList()
    const poll = setInterval(loadList, 20000)
    return () => clearInterval(poll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ch = supabase
      .channel('messages-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadList()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  function openThread(jobId: string) {
    setSelected(jobId)
    setThreads((prev) => prev.map((th) => (th.jobId === jobId ? { ...th, unread: 0 } : th)))
  }

  return (
    <div className="flex h-full bg-[#07090D]">
      {/* Thread rail */}
      <div
        className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 flex-shrink-0 border-r border-white/6`}
      >
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between flex-shrink-0">
          <h1 className="font-mono text-xs uppercase tracking-widest text-white/70">{t('messages')}</h1>
          {threads.some((th) => th.unread > 0) && (
            <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {threads.reduce((s, th) => s + th.unread, 0)}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && (
            <div className="p-3 flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/8 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-white/8 rounded mb-2" />
                    <div className="h-2.5 w-40 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center font-mono text-xs text-white/40">{error}</div>
          )}

          {!loading && !error && threads.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center gap-2">
              <MessageSquare size={22} className="text-white/20" />
              <span className="text-white/50 text-sm">{t('msgs_no_conversations')}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
                {t('msgs_threads_hint')}
              </span>
            </div>
          )}

          {!loading &&
            !error &&
            threads.map((th) => {
              const name = th.counterparty.firstName || t('customer')
              const seed = th.counterparty.id || th.jobId
              const active = selected === th.jobId
              const preview = th.lastMessage
                ? `${th.lastMessage.fromMe ? t('msgs_you_prefix') : ''}${th.lastMessage.text}`
                : t('msgs_no_messages_short')
              return (
                <button
                  key={th.jobId}
                  onClick={() => openThread(th.jobId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/4 ${
                    active ? 'bg-white/6' : 'hover:bg-white/3'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {th.counterparty.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={th.counterparty.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm ${avatarColor(seed)}`}
                      >
                        {initial(name)}
                      </div>
                    )}
                    {th.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-[#07090D]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${th.unread > 0 ? 'text-white font-medium' : 'text-white/80'}`}>
                        {name}
                      </span>
                      {th.lastMessage && (
                        <span className="font-mono text-[9px] text-white/30 flex-shrink-0">
                          {fmtWhen(th.lastMessage.at)}
                        </span>
                      )}
                    </div>
                    <div
                      dir="auto"
                      className={`text-xs truncate mt-0.5 ${th.lastMessage ? 'text-white/40' : 'text-white/25 italic'} ${
                        th.unread > 0 ? 'text-white/70' : ''
                      }`}
                    >
                      {preview}
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>

      {/* Conversation pane */}
      <div className={`${selected ? 'flex' : 'hidden lg:flex'} flex-1 flex-col min-w-0`}>
        {selected ? (
          <ChatThread jobId={selected} onBack={() => setSelected(null)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <MessageSquare size={20} className="text-white/30" />
            </div>
            <span className="text-white/50 text-sm">{t('msgs_select_conversation')}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
              {t('msgs_pick_thread')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
