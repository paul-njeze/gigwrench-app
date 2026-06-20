'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const GREETING =
  "Hey there! I'm Dispatch, your GigWrench coordinator. How can I help you today?"

export default function DispatchTestPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  function reset() {
    setMessages([{ role: 'assistant', content: GREETING }])
    setInput('')
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/dispatch/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversation_history: messages,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Test error: ${data.error ?? 'request failed'}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || '(no response)' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Test error: could not reach the preview endpoint.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 bg-[#0B0F17] border border-white/6 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-sm text-white font-medium">Test Dispatch</div>
            <div className="text-white/30 text-xs">Chat as a customer to preview how Dispatch responds. Nothing is saved or sent.</div>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-white/30"/> : <ChevronDown size={16} className="text-white/30"/>}
      </button>

      {open && (
        <div className="border-t border-white/6">
          <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                    <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                      <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-yellow-400 text-black font-medium rounded-br-sm' : 'bg-white/5 text-white/85 rounded-bl-sm border border-white/6'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                  <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                    <path d="M3 14L7 6L10 11L13 5L16 10" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="bg-white/5 border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="p-3 border-t border-white/6 flex items-center gap-2">
            <button
              onClick={reset}
              title="Reset conversation"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <RotateCcw size={14} className="text-white/50"/>
            </button>
            <div className="flex-1 flex gap-2 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Type a customer message..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25 font-mono"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-xl bg-yellow-400 hover:bg-yellow-300 transition-colors flex items-center justify-center disabled:opacity-30 flex-shrink-0"
              >
                {loading ? <Loader2 size={13} className="text-black animate-spin"/> : <Send size={13} className="text-black"/>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
