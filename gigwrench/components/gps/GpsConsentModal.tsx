'use client'

import { MapPin, X } from 'lucide-react'

interface GpsConsentModalProps {
  open: boolean
  title: string
  body: string
  acceptLabel: string
  declineLabel: string
  onAccept: () => void
  onDecline: () => void
}

export default function GpsConsentModal({
  open,
  title,
  body,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
}: GpsConsentModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-2xl p-6 relative">
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4">
          <MapPin size={20} className="text-yellow-400" />
        </div>
        <h2 className="font-display text-xl tracking-wide text-white mb-2">{title}</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6 whitespace-pre-line">{body}</p>
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors font-mono text-[11px] uppercase tracking-wider"
          >
            {declineLabel}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-mono text-[11px] uppercase tracking-wider font-bold"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
