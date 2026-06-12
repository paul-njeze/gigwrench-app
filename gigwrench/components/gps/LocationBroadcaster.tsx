'use client'

import { useState, useRef, useCallback } from 'react'
import { MapPin, Navigation, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  jobId: string
  jobTitle: string
}

const TRACKING_BASE = 'https://gigwrench-app.vercel.app/track'

export default function LocationBroadcaster({ jobId, jobTitle }: Props) {
  const [active, setActive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastPostRef = useRef<number>(0)

  const trackingUrl = `${TRACKING_BASE}/${jobId}`

  const postLocation = useCallback(async (lat: number, lng: number) => {
    const now = Date.now()
    if (now - lastPostRef.current < 4500) return
    lastPostRef.current = now

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch('/api/gps/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ job_id: jobId, lat, lng }),
      })
    } catch {
      // silent fail - continue broadcasting
    }
  }, [jobId])

  const stopBroadcasting = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setActive(false)
  }, [])

  const startBroadcasting = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError(null)

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        postLocation(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please enable location in your browser settings.')
          stopBroadcasting()
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    watchIdRef.current = watchId
    setActive(true)
  }, [postLocation])

  const handleToggle = () => {
    if (active) {
      stopBroadcasting()
    } else {
      startBroadcasting()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <button
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-all w-full justify-center',
          active
            ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/20'
            : 'bg-[var(--color-gw-accent,#F5C518)]/10 border border-[var(--color-gw-accent,#F5C518)]/20 text-[var(--color-gw-accent,#F5C518)] hover:bg-[var(--color-gw-accent,#F5C518)]/15',
        ].join(' ')}
        title={jobTitle}
      >
        {active ? (
          <>
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <Navigation size={14} />
            <span className="tracking-widest text-[11px] uppercase">Broadcasting Location</span>
          </>
        ) : (
          <>
            <MapPin size={14} />
            <span className="tracking-widest text-[11px] uppercase">Share Live Location</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-[11px] text-red-400 font-mono leading-snug">{error}</p>
      )}

      {active && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-white/30 font-mono flex-shrink-0">Share with customer:</span>
          <span className="text-[10px] text-white/50 font-mono truncate flex-1">{trackingUrl}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Copy tracking link"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
          {copied && (
            <span className="text-[10px] text-green-400 font-mono flex-shrink-0">Copied!</span>
          )}
        </div>
      )}
    </div>
  )
}
