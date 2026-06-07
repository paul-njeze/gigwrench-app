'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface ProLocation {
  id: string
  lat: number
  lng: number
  updated_at: string
}

declare global {
  interface Window {
    L: any
  }
}

export default function TrackPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [waiting, setWaiting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
    let leafletLoaded = false

    function initMap(lat: number, lng: number) {
      if (!mapRef.current || mapInstanceRef.current) return
      if (typeof window === 'undefined' || !window.L) return

      const L = window.L

      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current).setView([lat, lng], 15)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([lat, lng]).addTo(map)
      marker.bindPopup('Your Pro is here').openPopup()
      markerRef.current = marker
    }

    function updateMarker(lat: number, lng: number) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng])
        }
      } else {
        initMap(lat, lng)
      }
      setLastUpdate(new Date().toLocaleTimeString())
    }

    async function loadLeaflet(): Promise<void> {
      return new Promise((resolve) => {
        if (window.L) { resolve(); return }

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })
    }

    async function init() {
      try {
        const { data, error: fetchError } = await supabase
          .from('pro_locations')
          .select('id, lat, lng, updated_at')
          .eq('job_id', jobId)
          .maybeSingle()

        if (fetchError) {
          setError('Could not load location data.')
          return
        }

        if (data) {
          setWaiting(false)
          await loadLeaflet()
          leafletLoaded = true
          initMap(data.lat, data.lng)
          setLastUpdate(new Date(data.updated_at).toLocaleTimeString())
        }

        const channel = supabase
          .channel('pro-location-' + jobId)
          .on(
            'postgres_changes' as any,
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'pro_locations',
              filter: `job_id=eq.${jobId}`,
            },
            async (payload: any) => {
              setWaiting(false)
              if (!leafletLoaded) {
                await loadLeaflet()
                leafletLoaded = true
              }
              updateMarker(payload.new.lat, payload.new.lng)
            }
          )
          .on(
            'postgres_changes' as any,
            {
              event: 'INSERT',
              schema: 'public',
              table: 'pro_locations',
              filter: `job_id=eq.${jobId}`,
            },
            async (payload: any) => {
              setWaiting(false)
              if (!leafletLoaded) {
                await loadLeaflet()
                leafletLoaded = true
              }
              updateMarker(payload.new.lat, payload.new.lng)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
            markerRef.current = null
          }
        }
      } catch (err) {
        setError('An unexpected error occurred.')
      }
    }

    const cleanup = init()
    return () => {
      cleanup.then((fn) => fn && fn())
    }
  }, [jobId])

  return (
    <div className="flex flex-col h-screen bg-[#07090D]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0B0F17] flex-shrink-0"
        style={{ height: '56px' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2.5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem', color: 'white' }}>
            GIG<span style={{ color: '#F5C518' }}>WRENCH</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-white/50" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Live tracking -- your Pro is on the way
          </span>
        </div>
      </header>

      {/* Map area */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {waiting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#07090D]">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            <p className="text-white/40 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Waiting for Pro to share location...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#07090D]">
            <p className="text-red-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{error}</p>
          </div>
        )}

        <div
          ref={mapRef}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        />

        {lastUpdate && (
          <div
            className="absolute bottom-4 right-4 z-20 bg-[#0B0F17]/90 border border-white/8 rounded-lg px-3 py-1.5"
          >
            <span className="text-[10px] text-white/40" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Updated {lastUpdate}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="flex items-center justify-center px-4 border-t border-white/6 bg-[#0B0F17] flex-shrink-0"
        style={{ height: '40px' }}
      >
        <span className="text-[11px] text-white/20" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Powered by GigWrench
        </span>
      </footer>
    </div>
  )
            }
