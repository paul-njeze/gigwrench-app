'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Star, MapPin, Briefcase, ShieldCheck, ChevronLeft,
  ChevronRight, Heart, X, ArrowLeft
} from 'lucide-react'

interface Pro {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  avg_rating: number
  total_reviews: number
  total_jobs: number
  distance_miles: number
  id_verified: boolean
  trades: Array<{ category: string; subcategory: string }>
  language: string
}

const CATEGORIES = [
  'All', 'Plumbing', 'Electrical', 'HVAC', 'Carpentry',
  'Cleaning', 'Painting', 'Landscaping', 'Security'
]

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Electrical: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/25',
  HVAC: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Carpentry: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Cleaning: 'bg-green-500/15 text-green-400 border-green-500/25',
  Painting: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Landscaping: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Security: 'bg-red-500/15 text-red-400 border-red-500/25',
}

export default function FindAProPage() {
  const [pros, setPros] = useState<Pro[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [shortlisted, setShortlisted] = useState<Pro[]>([])
  const [expanded, setExpanded] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

    const fetchPros = useCallback(async (cat: string) => {
    setLoading(true)
    const timeout = setTimeout(() => { setLoading(false) }, 8000)
    try {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          clearTimeout(timeout)
          const { latitude, longitude } = pos.coords
          const catParam = cat === 'All' ? '' : `&category=${cat.toLowerCase()}`
          const res = await fetch(`/api/pros/nearby?lat=${latitude}&lng=${longitude}&radius=25${catParam}`)
          const data = await res.json()
          setPros(data.pros || [])
          setIndex(0)
          setLoading(false)
        },
        () => {
          clearTimeout(timeout)
          fetch(`/api/pros/nearby?lat=40.7128&lng=-74.0060&radius=50${cat === 'All' ? '' : `&category=${cat.toLowerCase()}`}`)
            .then(r => r.json())
            .then(data => { setPros(data.pros || []); setIndex(0); setLoading(false) })
            .catch(() => setLoading(false))
        },
        { timeout: 6000 }
      )
    } catch {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPros(category) }, [category, fetchPros])

  const current = pros[index]

  function swipeRight() {
    if (!current) return
    setShortlisted(prev => [...prev, current])
    setIndex(i => i + 1)
    setDragX(0)
    setExpanded(false)
  }

  function swipeLeft() {
    setIndex(i => i + 1)
    setDragX(0)
    setExpanded(false)
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragX(e.clientX - startX.current)
  }

  function onPointerUp() {
    if (!dragging) return
    setDragging(false)
    if (dragX > 80) swipeRight()
    else if (dragX < -80) swipeLeft()
    else setDragX(0)
  }

  const cardStyle = {
    transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
    transition: dragging ? 'none' : 'transform 0.3s ease',
    cursor: dragging ? 'grabbing' : 'grab',
  }

  const swipeIndicatorRight = dragX > 40
  const swipeIndicatorLeft = dragX < -40

  if (loading) return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
        <span className="font-mono text-xs text-white/30 tracking-widest uppercase">Finding Pros near you</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20}/>
        </Link>
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">Find a Pro</h1>
          <p className="text-white/40 text-xs mt-0.5">Swipe right to shortlist, left to pass</p>
        </div>
        {shortlisted.length > 0 && (
          <div className="ml-auto bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
            <span className="text-yellow-400 text-xs font-bold">{shortlisted.length} saved</span>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider border transition-all
              ${category === cat
                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                : 'bg-white/4 border-white/8 text-white/40 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {pros.length === 0 && (
          <div className="text-center">
            <p className="text-white/40 text-sm">No Pros found in your area yet.</p>
            <p className="text-white/20 text-xs mt-2">Try a different category or expand your radius.</p>
          </div>
        )}

        {index >= pros.length && pros.length > 0 && (
          <div className="text-center">
            <p className="text-white font-semibold mb-2">You have seen all Pros nearby.</p>
            <p className="text-white/40 text-sm mb-6">{shortlisted.length} saved to your shortlist.</p>
            <button onClick={() => { setIndex(0); setShortlisted([]) }}
              className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl text-sm">
              Start over
            </button>
          </div>
        )}

        {current && index < pros.length && (
          <>
            {/* Pro card */}
            <div ref={cardRef} style={cardStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="w-full max-w-sm bg-[#131C28] border border-white/8 rounded-3xl overflow-hidden select-none relative"
              onClick={() => !dragging && setExpanded(e => !e)}>

              {/* Swipe indicators */}
              {swipeIndicatorRight && (
                <div className="absolute top-6 left-6 z-10 bg-green-500/90 rounded-xl px-4 py-2 rotate-[-12deg]">
                  <span className="text-white font-black text-lg tracking-wider">SAVE</span>
                </div>
              )}
              {swipeIndicatorLeft && (
                <div className="absolute top-6 right-6 z-10 bg-red-500/90 rounded-xl px-4 py-2 rotate-[12deg]">
                  <span className="text-white font-black text-lg tracking-wider">PASS</span>
                </div>
              )}

              {/* Photo */}
              <div className="h-72 bg-gradient-to-br from-[#1E2D42] to-[#0B0F17] relative">
                {current.avatar_url ? (
                  <img src={current.avatar_url} alt={current.name}
                    className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-3xl">
                        {current.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                {/* Verified badge */}
                {current.id_verified && (
                  <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1.5">
                    <ShieldCheck size={11} className="text-white"/>
                    <span className="text-white text-[10px] font-bold">Verified</span>
                  </div>
                )}
                {/* Trade badge */}
                {current.trades?.[0] && (
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-[10px] font-bold backdrop-blur
                    ${CATEGORY_COLORS[current.trades[0].category] || 'bg-white/10 text-white/60 border-white/20'}`}>
                    {current.trades[0].category}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-white font-bold text-xl">{current.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400"/>
                        <span className="text-white/70 text-sm font-medium">
                          {current.avg_rating > 0 ? current.avg_rating.toFixed(1) : 'New'}
                        </span>
                        {current.total_reviews > 0 && (
                          <span className="text-white/30 text-xs">({current.total_reviews})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-white/30 text-xs">
                        <Briefcase size={10}/>
                        <span>{current.total_jobs} jobs</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/30 text-xs">
                        <MapPin size={10}/>
                        <span>{current.distance_miles} mi</span>
                      </div>
                    </div>
                  </div>
                </div>

                {current.bio && (
                  <p className={`text-white/50 text-sm leading-relaxed mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
                    {current.bio}
                  </p>
                )}

                <p className="text-white/20 text-xs text-center mt-2">
                  {expanded ? 'Tap to collapse' : 'Tap card for more info'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-6 mt-6">
              <button onClick={swipeLeft}
                className="w-14 h-14 rounded-full bg-[#131C28] border border-white/8 flex items-center justify-center hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                <X size={22} className="text-white/40"/>
              </button>
              <Link href={`/book/${current.id}`}
                className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-2xl text-sm hover:bg-yellow-300 transition-colors no-underline">
                Book Now
              </Link>
              <button onClick={swipeRight}
                className="w-14 h-14 rounded-full bg-[#131C28] border border-white/8 flex items-center justify-center hover:border-green-500/30 hover:bg-green-500/5 transition-all">
                <Heart size={22} className="text-white/40"/>
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-5">
              {pros.slice(0, Math.min(pros.length, 8)).map((_, i) => (
                <div key={i}
                  className={`rounded-full transition-all ${i === index
                    ? 'w-4 h-1.5 bg-yellow-400'
                    : i < index ? 'w-1.5 h-1.5 bg-white/15' : 'w-1.5 h-1.5 bg-white/8'}`}/>
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={swipeLeft} disabled={index === 0}
                className="text-white/20 hover:text-white/50 disabled:opacity-30 transition-colors">
                <ChevronLeft size={18}/>
              </button>
              <span className="text-white/20 text-xs font-mono">
                {index + 1} / {pros.length}
              </span>
              <button onClick={swipeRight}
                className="text-white/20 hover:text-white/50 transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Shortlist drawer */}
      {shortlisted.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#131C28] border-t border-white/8 p-4">
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-3">
            Shortlisted ({shortlisted.length})
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {shortlisted.map(pro => (
              <Link key={pro.id} href={`/book/${pro.id}`}
                className="flex-shrink-0 no-underline">
                <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center overflow-hidden">
                  {pro.avatar_url
                    ? <img src={pro.avatar_url} alt={pro.name} className="w-full h-full object-cover"/>
                    : <span className="text-yellow-400 font-bold text-sm">{pro.name.charAt(0)}</span>
                  }
                </div>
                <p className="text-white/40 text-[9px] text-center mt-1 w-12 truncate">{pro.name.split(' ')[0]}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
