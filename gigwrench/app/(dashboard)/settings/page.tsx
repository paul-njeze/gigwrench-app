'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, RotateCcw } from 'lucide-react'
import { useLang } from '@/lib/lang'

export default function SettingsPage() {
  const { t } = useLang()
  const [launched, setLaunched] = useState(false)

  function restartTour() {
    window.dispatchEvent(new Event('gw-start-tour'))
    setLaunched(true)
    setTimeout(() => setLaunched(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
          <SettingsIcon size={16} className="text-yellow-400" />
        </div>
        <h1 className="font-display text-2xl tracking-widest text-white">{t('settings')}</h1>
      </div>

      <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
        <p className="text-white/50 text-sm mb-4 leading-relaxed">{t('tour_help')}</p>
        <button
          onClick={restartTour}
          className="flex items-center gap-2 bg-[#131C28] border border-white/8 text-white/70 hover:text-white hover:border-yellow-400/40 transition-all px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest"
        >
          <RotateCcw size={14} className="text-yellow-400" />
          {launched ? t('tour_starting') : t('tour_restart')}
        </button>
      </div>
    </div>
  )
}
