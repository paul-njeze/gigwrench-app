'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { Share2, Copy, Check, Mail, MessageCircle, X } from 'lucide-react'

// A general "share GigWrench" invite any signed-in user (Pro or customer) can
// send so a friend signs up. This is distinct from the job-scoped customer
// invite in CustomerLinkCard, which links a specific job. No backend is needed:
// the link is built client side. The ref param threads a referrer id for future
// attribution and is harmless if nothing reads it yet.

const LANDING = 'https://gigwrench.app'

export default function InviteToGigWrench() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [ref, setRef] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    const supabase = createClient()
    let active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setRef(session?.user?.id || null)
    })
    return () => {
      active = false
    }
  }, [])

  const url = ref ? `${LANDING}/?ref=${ref}` : LANDING
  const message = `${t('invite_message')} ${url}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the link stays visible to copy by hand.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: 'GigWrench', text: t('invite_message'), url })
    } catch {
      // User dismissed the share sheet, nothing to do.
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`
  const sms = `sms:?&body=${encodeURIComponent(message)}`
  const mail = `mailto:?subject=${encodeURIComponent(t('invite_email_subject'))}&body=${encodeURIComponent(message)}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all"
      >
        <Share2 size={16} className="text-white/30" />
        <span className="font-mono text-xs uppercase tracking-widest">{t('invite_friends')}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0B0F17] border border-white/8 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-white text-base font-semibold">{t('invite_title')}</h2>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-5">{t('invite_subtitle')}</p>

            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">{t('invite_link_label')}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-[#07090D] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white/70 truncate">
                {url}
              </div>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider hover:bg-yellow-400/20 transition-colors flex-shrink-0"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? t('invite_copied') : t('invite_copy')}
              </button>
            </div>

            {canShare && (
              <button
                onClick={nativeShare}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors mb-3"
              >
                <Share2 size={15} /> {t('invite_share')}
              </button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 bg-white/4 border border-white/8 rounded-lg py-3 text-white/70 hover:bg-white/8 transition-colors no-underline">
                <MessageCircle size={16} className="text-green-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{t('invite_via_whatsapp')}</span>
              </a>
              <a href={sms} className="flex flex-col items-center gap-1.5 bg-white/4 border border-white/8 rounded-lg py-3 text-white/70 hover:bg-white/8 transition-colors no-underline">
                <MessageCircle size={16} className="text-blue-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{t('invite_via_sms')}</span>
              </a>
              <a href={mail} className="flex flex-col items-center gap-1.5 bg-white/4 border border-white/8 rounded-lg py-3 text-white/70 hover:bg-white/8 transition-colors no-underline">
                <Mail size={16} className="text-yellow-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{t('invite_via_email')}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
