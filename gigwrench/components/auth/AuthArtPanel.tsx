'use client'

export default function AuthArtPanel() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src="/auth/gigwrench-pro-van.jpg"
        alt=""
        className="gw-bg absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '50% 45%' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,9,13,0.95) 0%, rgba(7,9,13,0.85) 15%, rgba(7,9,13,0.32) 38%, rgba(7,9,13,0.05) 64%, rgba(7,9,13,0.2) 100%), linear-gradient(180deg, rgba(7,9,13,0.35) 0%, rgba(7,9,13,0) 20%, rgba(7,9,13,0) 64%, rgba(7,9,13,0.55) 100%)',
        }}
      />

      {/* Live dispatch card */}
      <div className="hidden lg:block absolute right-8 bottom-8 w-[340px] rounded-2xl border border-white/10 p-4 shadow-2xl bg-[#0B1018]/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/auth/pro-avatar.jpg" alt="" className="w-11 h-11 rounded-xl object-cover border border-yellow-400/40" />
          <div className="leading-tight">
            <div className="text-white text-sm font-semibold">Your Pro is</div>
            <div className="text-white text-sm font-semibold">on the way</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-yellow-400 text-xs font-bold font-mono">ETA 8 min</div>
            <div className="text-white/50 text-[11px] font-mono">2.1 mi away</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 mb-1 font-mono text-[11px] tracking-widest uppercase text-emerald-300">
          <span className="gw-blink w-1.5 h-1.5 rounded-full bg-emerald-300" /> Live tracking
        </div>
        <svg viewBox="0 0 308 64" width="100%" height="60" fill="none">
          <path d="M14 52 H80 V28 H160 V44 H240 V14" stroke="#1E2D42" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path className="gw-route" id="gwAuthRoute" d="M14 52 H80 V28 H160 V44 H240 V14" stroke="#F5C518" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <path className="gw-route-pulse" d="M14 52 H80 V28 H160 V44 H240 V14" stroke="#FFF1B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="52" r="5" fill="#F5C518" />
          <g transform="translate(240,14)">
            <path d="M0 -11 a7 7 0 1 1 0.01 0 z M0 3 l-5 -10 h10 z" fill="#F5C518" />
            <circle cy="-5" r="3" fill="#0B1220" />
          </g>
          <g>
            <rect x="-12" y="-7" width="24" height="14" rx="3" fill="#1E2D42" stroke="#F5C518" strokeWidth="1.6" />
            <rect x="-7" y="-4" width="7" height="8" rx="1.5" fill="#0E1726" />
            <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#gwAuthRoute" />
            </animateMotion>
          </g>
        </svg>
        <div className="flex justify-between mt-3 pt-3 border-t border-white/8">
          <div className="flex flex-col items-center gap-1.5 text-[9px] tracking-wide uppercase text-white/55 font-mono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="1.6"><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>
            AI Dispatch
          </div>
          <div className="flex flex-col items-center gap-1.5 text-[9px] tracking-wide uppercase text-white/55 font-mono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            Live ETA
          </div>
          <div className="flex flex-col items-center gap-1.5 text-[9px] tracking-wide uppercase text-white/55 font-mono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="1.6"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
            Verified Pro
          </div>
        </div>
      </div>

      <style>{`
        .gw-bg { animation: gwKen 30s ease-in-out infinite alternate; transform-origin: 55% 50%; }
        @keyframes gwKen { from { transform: scale(1.0); } to { transform: scale(1.05); } }
        .gw-route { stroke-dasharray: 260; stroke-dashoffset: 260; animation: gwDraw 8s ease-in-out infinite; }
        .gw-route-pulse { stroke-dasharray: 8 120; animation: gwFlow 2.4s linear infinite; }
        .gw-blink { animation: gwBlink 1.6s ease-in-out infinite; }
        @keyframes gwDraw { 0% { stroke-dashoffset: 260; } 55%, 100% { stroke-dashoffset: 0; } }
        @keyframes gwFlow { to { stroke-dashoffset: -128; } }
        @keyframes gwBlink { 50% { opacity: 0.25; } }
        @media (prefers-reduced-motion: reduce) {
          .gw-bg, .gw-route, .gw-route-pulse, .gw-blink { animation: none; }
        }
      `}</style>
    </div>
  )
}
