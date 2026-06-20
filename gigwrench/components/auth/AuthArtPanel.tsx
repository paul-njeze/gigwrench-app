'use client'

import { useState, useEffect } from 'react'
import { Zap, Droplets, Snowflake, KeyRound, Hammer } from 'lucide-react'

const SCENES = [
  { name: 'Electrical', Icon: Zap },
  { name: 'Plumbing', Icon: Droplets },
  { name: 'Climate', Icon: Snowflake },
  { name: 'Locksmith', Icon: KeyRound },
  { name: 'Carpentry', Icon: Hammer },
]

export default function AuthArtPanel() {
  const [active, setActive] = useState(0)
  const [motion, setMotion] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setMotion(!mq.matches)
    const onChange = () => setMotion(!mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!motion) return
    const id = setInterval(() => setActive(a => (a + 1) % SCENES.length), 3600)
    return () => clearInterval(id)
  }, [motion])

  return (
    <div className="gw-art absolute inset-0 overflow-hidden flex flex-col justify-between p-12">
      <div className="gw-art-grid absolute inset-0" aria-hidden="true" />
      <div className="gw-art-glow absolute inset-0" aria-hidden="true" />

      {/* Eyebrow */}
      <div className="relative flex items-center gap-2">
        <span className="gw-blink w-2 h-2 rounded-full bg-yellow-400" />
        <span className="font-mono text-[11px] tracking-[0.3em] text-yellow-400/80 uppercase">Dispatch live</span>
      </div>

      {/* Hero: cycling trade glyph over the live pulse */}
      <div className="relative flex flex-col items-center justify-center flex-1">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {SCENES.map((s, i) => {
            const Icon = s.Icon
            return (
              <div
                key={s.name}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
                style={{ opacity: i === active ? 1 : 0 }}
                aria-hidden={i !== active}
              >
                <Icon size={96} strokeWidth={1.5} color="#F5C518" style={{ filter: 'drop-shadow(0 0 26px rgba(245,197,24,0.35))' }} />
              </div>
            )
          })}
        </div>

        <svg className="mt-8" width="280" height="48" viewBox="0 0 280 48" fill="none" aria-hidden="true">
          <path
            id="gwPulse"
            className="gw-pulse-line"
            d="M0 24 H92 L106 8 L120 40 L134 16 L148 24 H280"
            stroke="#F5C518"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <circle r="3.5" fill="#F5C518">
            {motion && (
              <animateMotion dur="3s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                <mpath href="#gwPulse" />
              </animateMotion>
            )}
          </circle>
        </svg>

        <div className="mt-5 h-5 relative w-full flex items-center justify-center">
          {SCENES.map((s, i) => (
            <span
              key={s.name}
              className="absolute font-mono text-xs tracking-[0.35em] text-white/45 uppercase transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Brand line */}
      <div className="relative">
        <p className="font-display text-3xl leading-tight tracking-wide text-white">
          Run your trade<br />like a Pro.
        </p>
        <p className="mt-3 font-mono text-xs text-white/40 leading-relaxed max-w-xs">
          Live tracking, AI dispatch, and verified reviews. One platform for every job.
        </p>
      </div>

      <style>{`
        .gw-art {
          background:
            radial-gradient(120% 80% at 82% 8%, rgba(245,197,24,0.10), transparent 58%),
            linear-gradient(155deg, #0E1726 0%, #07090D 72%);
        }
        .gw-art-grid {
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.5;
          animation: gwDrift 9s linear infinite;
        }
        .gw-art-glow {
          background: radial-gradient(40% 40% at 50% 55%, rgba(245,197,24,0.06), transparent 70%);
        }
        .gw-pulse-line {
          stroke-dasharray: 18 220;
          animation: gwFlow 3s linear infinite;
        }
        @keyframes gwDrift { to { background-position: 26px 26px; } }
        @keyframes gwFlow { to { stroke-dashoffset: -238; } }
        .gw-blink { animation: gwBlink 1.6s ease-in-out infinite; }
        @keyframes gwBlink { 50% { opacity: 0.25; } }
        @media (prefers-reduced-motion: reduce) {
          .gw-art-grid, .gw-pulse-line, .gw-blink { animation: none; }
        }
      `}</style>
    </div>
  )
}
