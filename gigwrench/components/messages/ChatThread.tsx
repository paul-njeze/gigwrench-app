'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Languages, ChevronLeft } from 'lucide-react'

type Message = {
  id: string
  sender_id: string | null
  recipient_id: string | null
  original_text: string
  original_language: string
  translated_text: string | null
  translated_language: string | null
  read_at: string | null
  created_at: string
  message_type: string
}

type Me = { id: string; firstName: string; language: string; role: 'pro' | 'customer' }
type Counterparty = {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  language: string
  role: 'pro' | 'customer'
} | null

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function initials(first: string, last: string) {
  const a = (first || '').trim().charAt(0)
  const b = (last || '').trim().charAt(0)
  return (a + b).toUpperCase() || '?'
}

export default function ChatThread({ jobId, onBack }: { jobId: string; onBack?: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [me, setMe] = useState<Me | null>(null)
  const [counterparty, setCounterparty] = useState<Counterparty>(null)
  const [title, setTitle] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const meIdRef = useRef<string>('')

  async function token(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      const t = await token()
      if (!t) {
        if (!cancelled) {
          setError('Please sign in to view this conversation.')
          setLoading(false)
        }
        return
      }
      try {
        const res = await fetch(`/api/messages/${jobId}`, { headers: { Authorization: `Bearer ${t}` } })
        const data = await res.json()
        if (cancelled) return
        if (!data.ok) {
          setError('This conversation could not be loaded.')
          setLoading(false)
          return
        }
        setMe(data.me)
        meIdRef.current = data.me?.id || ''
        setCounterparty(data.counterparty)
        setTitle(data.job?.title || 'Job')
        setMessages(data.messages || [])
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('This conversation could not be loaded.')
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [jobId])

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${jobId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        (payload) => {
          const m = payload.new as Message
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
          if (m.recipient_id && m.recipient_id === meIdRef.current && !m.read_at) {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', m.id).then(() => {})
          }
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId, supabase])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    const t = await token()
    if (!t) {
      setSending(false)
      return
    }
    try {
      const res = await fetch(`/api/messages/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.ok && data.message) {
        setMessages((prev) => (prev.some((x) => x.id === data.message.id) ? prev : [...prev, data.message]))
        setInput('')
      }
    } catch {
      // A failed send leaves the text in the box so the user can retry.
    }
    setSending(false)
  }

  function viewFor(m: Message) {
    const mine = m.sender_id === me?.id
    const myLang = me?.language || 'en'
    const hasTranslation = !!m.translated_text
    let primary = m.original_text
    let alt: string | null = null
    let translatedTag = false
    if (mine) {
      primary = m.original_text
      alt = hasTranslation ? m.translated_text : null
    } else if (hasTranslation && m.translated_language === myLang) {
      primary = m.translated_text as string
      alt = m.original_text
      translatedTag = true
    }
    const showingAlt = !!revealed[m.id]
    const text = showingAlt && alt ? alt : primary
    return { mine, text, hasAlt: !!alt, translatedTag, showingAlt }
  }

  function toggle(id: string) {
    setRevealed((r) => ({ ...r, [id]: !r[id] }))
  }

  const cpName = counterparty ? `${counterparty.firstName} ${counterparty.lastName}`.trim() || 'Customer' : 'Conversation'

  return (
    <div className="flex flex-col h-full bg-[#0B0F17]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {counterparty?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={counterparty.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-xs text-white/60">
              {counterparty ? initials(counterparty.firstName, counterparty.lastName) : '?'}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-white font-medium truncate">{cpName}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 truncate">{title}</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <span className="font-mono text-xs text-white/40 tracking-wide">{error}</span>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
            <span className="text-white/50 text-sm">No messages yet.</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">Say hello to get started</span>
          </div>
        )}

        {!loading &&
          !error &&
          messages.map((m) => {
            const v = viewFor(m)
            return (
              <div key={m.id} className={`flex flex-col max-w-[78%] ${v.mine ? 'self-end items-end' : 'self-start items-start'}`}>
                <div
                  dir="auto"
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    v.mine
                      ? 'bg-yellow-400 text-black rounded-br-sm'
                      : 'bg-white/6 text-white/90 rounded-bl-sm'
                  }`}
                >
                  {v.text}
                </div>
                <div className={`flex items-center gap-2 mt-1 px-1 ${v.mine ? 'flex-row-reverse' : ''}`}>
                  <span className="font-mono text-[9px] text-white/25">{fmtTime(m.created_at)}</span>
                  {v.translatedTag && !v.showingAlt && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/25 flex items-center gap-1">
                      <Languages size={10} /> Translated
                    </span>
                  )}
                  {v.hasAlt && (
                    <button
                      onClick={() => toggle(m.id)}
                      className="font-mono text-[9px] uppercase tracking-wider text-white/30 hover:text-yellow-400 transition-colors"
                    >
                      {v.showingAlt ? (v.mine ? 'Hide translation' : 'Hide original') : v.mine ? 'Show translation' : 'Show original'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Compose */}
      <div className="border-t border-white/6 p-3 flex items-end gap-2 flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder="Type a message"
          className="flex-1 resize-none bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-yellow-400/40 max-h-32"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  )
}
