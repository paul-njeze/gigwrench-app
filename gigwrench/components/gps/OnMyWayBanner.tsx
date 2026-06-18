'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Navigation, Copy, Check, MapPin, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TRACKING_BASE = 'https://app.gigwrench.app/track'
const ARRIVAL_THRESHOLD_MI = 0.1
const POST_INTERVAL_MS = 5000

interface ActiveJob {
  id: string
  title: string
  lat: number | null
  lng: number | null
}

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8 // earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function OnMyWayBanner() {
  const [job, setJob] = useState<ActiveJob | null>(null)
  const [distanceMi, setDistanceMi] = useState<number | null>(null)
  const [arrived, setArrived] = useState(false)
  const [copied, setCopied] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const lastPostRef = useRef<number>(0)
  const arrivedFiredRef = useRef<boolean>(false)

  const trackingUrl = job ? `${TRACKING_BASE}/${job.id}` : ''

  const loadActiveTrip = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('jobs')
      .select('id,title,lat,lng')
      .eq('pro_id', user.id)
      .eq('status', 'on_the_way')
      .is('arrived_at', null)
      .order('on_the_way_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      setJob(data as ActiveJob)
      setArrived(false)
      arrivedFiredRef.current = false
    }
  }, [])

  // Load on mount and whenever a trip is started elsewhere in the app.
  useEffect(() => {
    loadActiveTrip()
    const onStart = () => loadActiveTrip()
    window.addEventListener('gw:omw-started', onStart)
    return () => window.removeEventListener('gw:omw-started', onStart)
  }, [loadActiveTrip])

  const fireArrived = useCallback(async () => {
    if (arrivedFiredRef.current || !job) return
    arrivedFiredRef.current = true
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await fetch('/api/gps/arrived', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ job_id: job.id }),
      })
      setArrived(true)
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    } catch {
      arrivedFiredRef.current = false
    }
  }, [job])

  const postLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!job) return
      // Distance updates on every fix; the network post is throttled.
      if (job.lat != null && job.lng != null) {
        const d = haversineMiles(lat, lng, job.lat, job.lng)
        setDistanceMi(d)
        if (d <= ARRIVAL_THRESHOLD_MI) fireArrived()
      }
      const now = Date.now()
      if (now - lastPostRef.current < POST_INTERVAL_MS) return
      lastPostRef.current = now
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        await fetch('/api/gps/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ job_id: job.id, lat, lng }),
        })
      } catch {
        // silent: keep broadcasting on the next fix
      }
    },
    [job, fireArrived]
  )

  // Broadcast while a trip is active and not yet arrived.
  useEffect(() => {
    if (!job || arrived) return
    if (!navigator.geolocation) {
      setGeoError('Location is not supported by this browser.')
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null)
        postLocation(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access is off. Turn it on to share your live arrival.')
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
    watchIdRef.current = watchId
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [job, arrived, postLocation])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard failure
    }
  }

  if (!job) return null

  if (arrived) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border-b border-green-500/20">
        <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-green-400">
          Arrived at {job.title}
        </span>
      </div>
    )
  }

  return (
    <div className="px-4 py-2.5 bg-yellow-400/10 border-b border-yellow-400/20">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
        </span>
        <Navigation size={14} className="text-yellow-400 flex-shrink-0" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-yellow-400 min-w-0 truncate">
          On the way to {job.title}
        </span>
        {distanceMi != null && (
          <span className="font-mono text-[11px] text-yellow-400/70 flex-shrink-0">
            {distanceMi < ARRIVAL_THRESHOLD_MI ? 'Arriving' : `${distanceMi.toFixed(1)} mi away`}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors font-mono text-[10px] uppercase tracking-wider"
            title="Copy tracking link"
          >
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            onClick={fireArrived}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-mono text-[10px] uppercase tracking-wider font-bold"
          >
            <MapPin size={11} />
            I have arrived
          </button>
        </div>
      </div>
      {geoError && (
        <p className="mt-1.5 font-mono text-[10px] text-red-400 leading-snug">{geoError}</p>
      )}
    </div>
  )
}
