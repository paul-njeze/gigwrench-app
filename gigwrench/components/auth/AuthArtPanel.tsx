'use client'

export default function AuthArtPanel() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#07090D]">
      {/* Blurred fill so the full photo shows with no empty margins */}
      <img
        src="/auth/gigwrench-pro-van.jpg"
        alt=""
        aria-hidden="true"
        className="gw-art-fill absolute inset-0 w-full h-full object-cover opacity-40"
      />
      {/* Full photo, nothing cropped */}
      <img
        src="/auth/gigwrench-pro-van.jpg"
        alt="A GigWrench Pro with a toolbox standing beside a branded GigWrench van on a neighborhood street"
        className="absolute inset-0 w-full h-full object-contain"
      />
      {/* Soft seam into the form side */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: 'linear-gradient(90deg, rgba(7,9,13,0.65) 0%, rgba(7,9,13,0) 14%)' }}
      />
      <style>{`
        .gw-art-fill { transform: scale(1.15); filter: blur(28px); animation: gwFill 26s ease-in-out infinite alternate; }
        @keyframes gwFill { from { transform: scale(1.12); } to { transform: scale(1.2); } }
        @media (prefers-reduced-motion: reduce) { .gw-art-fill { animation: none; } }
      `}</style>
    </div>
  )
}
