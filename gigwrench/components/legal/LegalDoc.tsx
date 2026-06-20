'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function renderMarkdown(md: string): ReactNode[] {
  const blocks = md.replace(/\r\n/g, '\n').trim().split(/\n\n+/)
  const out: ReactNode[] = []
  blocks.forEach((raw, i) => {
    const b = raw.trim()
    if (!b) return
    if (b.startsWith('## ')) {
      out.push(<h2 key={i} className="font-display text-lg tracking-wide text-white mt-8 mb-2">{b.slice(3)}</h2>)
    } else if (b.startsWith('# ')) {
      out.push(<h1 key={i} className="font-display text-3xl tracking-wide text-white mb-2">{b.slice(2)}</h1>)
    } else if (b.split('\n').every(l => l.trim().startsWith('- '))) {
      out.push(
        <ul key={i} className="list-disc pl-5 space-y-1.5 my-3">
          {b.split('\n').map((l, j) => (
            <li key={j} className="text-white/55 text-sm leading-relaxed">{l.trim().slice(2)}</li>
          ))}
        </ul>
      )
    } else {
      out.push(<p key={i} className="text-white/55 text-sm leading-relaxed my-3">{b.replace(/\n/g, ' ')}</p>)
    }
  })
  return out
}

export default function LegalDoc({ slug }: { slug: string }) {
  const [md, setMd] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/legal/${slug}.md`)
      .then(r => (r.ok ? r.text() : Promise.reject()))
      .then(setMd)
      .catch(() => setError(true))
  }, [slug])

  return (
    <main className="min-h-screen bg-[#07090D] text-white px-5 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-8">
          <ArrowLeft size={12} /> GigWrench
        </Link>
        {error ? (
          <p className="text-white/40 text-sm font-mono">This document is unavailable right now.</p>
        ) : md === null ? (
          <p className="text-white/30 text-sm font-mono">Loading.</p>
        ) : (
          <article>{renderMarkdown(md)}</article>
        )}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/terms" className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-yellow-400">Terms</Link>
          <Link href="/privacy" className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-yellow-400">Privacy</Link>
          <Link href="/acceptable-use" className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-yellow-400">Acceptable Use</Link>
          <Link href="/enforcement" className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-yellow-400">Enforcement</Link>
        </div>
      </div>
    </main>
  )
}
