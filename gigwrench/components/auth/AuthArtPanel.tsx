'use client'

export default function AuthArtPanel() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07090D]">
      <img
        src="/auth/gigwrench-pro-van.jpg"
        alt="A GigWrench Pro with a toolbox standing beside a branded GigWrench van on a neighborhood street"
        className="gw-art-img absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '46% 50%' }}
      />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'linear-gradient(90deg, rgba(7,9,13,0.65) 0%, rgba(7,9,13,0) 16%)' }}
      />
      <style>{`
        .gw-art-img { animation: gwKen 26s ease-in-out infinite alternate; transform-origin: 50% 45%; }
        @keyframes gwKen { from { transform: scale(1.0); } to { transform: scale(1.07); } }
        @media (prefers-reduced-motion: reduce) { .gw-art-img { animation: none; } }
      `}</style>
    </div>
  )
}
