'use client'

import { useEffect, type ReactNode } from 'react'
import { LangProvider, useLang, LANGUAGES, type Language } from '@/lib/lang'

// Public booking flow has no account, so guess the customer's language from
// their browser on first load. A saved choice (gw_lang) always wins.
function detectBrowserLang(): Language | null {
  if (typeof navigator === 'undefined') return null
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const c of candidates) {
    if (!c) continue
    const base = c.toLowerCase().split('-')[0]
    if (base in LANGUAGES) return base as Language
  }
  return null
}

function AutoDetectLang() {
  const { setLang } = useLang()
  useEffect(() => {
    try {
      if (localStorage.getItem('gw_lang')) return
      const detected = detectBrowserLang()
      if (detected) setLang(detected)
    } catch {
      // localStorage or navigator unavailable; stay on default
    }
  }, [setLang])
  return null
}

export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <AutoDetectLang />
      {children}
    </LangProvider>
  )
}
