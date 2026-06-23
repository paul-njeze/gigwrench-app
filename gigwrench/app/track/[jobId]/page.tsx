'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ChatThread from '@/components/messages/ChatThread'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

declare global {
  interface Window {
    L: any
  }
}

type LatLng = [number, number]

function bearing(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]))
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]))
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

const VAN_HTML =
  '<div class="gw-van-rot" style="width:34px;height:42px;display:flex;align-items:center;justify-content:center;transition:transform 0.5s linear;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.55));">' +
  '<svg width="30" height="40" viewBox="0 0 32 42">' +
  '<rect x="6" y="3" width="20" height="34" rx="5" fill="#F7F7F5" stroke="#0B0F17" stroke-width="1.2"/>' +
  '<rect x="8.5" y="5" width="15" height="6" rx="2" fill="#36A2FF"/>' +
  '<rect x="9" y="13.5" width="14" height="11" rx="1.5" fill="#E6E6E2"/>' +
  '<rect x="8.5" y="29" width="15" height="5" rx="2" fill="#243349"/>' +
  '<rect x="3.5" y="9" width="3" height="2.4" rx="1" fill="#F7F7F5"/>' +
  '<rect x="25.5" y="9" width="3" height="2.4" rx="1" fill="#F7F7F5"/>' +
  '</svg></div>'

const CUSTOMER_PRIMARY = [
  "I'm home",
  'Please call when you arrive',
  'Running a few minutes late',
  'Use the side door',
]

const CUSTOMER_MORE = [
  'Please park in the driveway',
  'I will be about 10 minutes late',
  'Please knock, the doorbell is broken',
  'The unit is in the backyard',
  'My dog is friendly',
  'Text me when you are outside',
  'How much longer until you arrive?',
  'The gate code is ',
]

const PRO_PRIMARY = [
  "I'm on my way",
  'Running about 10 minutes late',
  "I've arrived, I'm outside",
  'Can you confirm the address?',
]

const PRO_MORE = [
  'I am parking now',
  'Please secure any pets',
  'I am at the gate',
  'Sending your invoice now',
  'Job complete, thank you!',
  'Can you give me a call?',
  'Be there in 5 minutes',
  'I need access to the work area',
]

export default function TrackPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const vanRef = useRef<any>(null)
  const destRef = useRef<any>(null)
  const routeRef = useRef<any>(null)
  const curRef = useRef<LatLng | null>(null)
  const rafRef = useRef<number | null>(null)
  const followRef = useRef<boolean>(true)
  const destRef2 = useRef<LatLng | null>(null)
  const lastRouteAt = useRef<number>(0)

  const [waiting, setWaiting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [proName, setProName] = useState<string>('Your Pro')
  const [eta, setEta] = useState<string | null>(null)
  const [dist, setDist] = useState<string | null>(null)
  const [following, setFollowing] = useState(true)
  const [contactPhone, setContactPhone] = useState<string | null>(null)
  const [role, setRole] = useState<'pro' | 'customer'>('customer')
  const [contactName, setContactName] = useState<string>('Your Pro')
  const [customerName, setCustomerName] = useState<string>('your customer')
  const [draft, setDraft] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!jobId) return
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
    let leafletLoaded = false

    function loadLeaflet(): Promise<void> {
      return new Promise((resolve) => {
        if (window.L) return resolve()
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

    function rotateVan(deg: number) {
      const el = vanRef.current?.getElement()?.querySelector('.gw-van-rot') as HTMLElement | null
      if (el) el.style.transform = `rotate(${deg}deg)`
    }

    function initMap(lat: number, lng: number) {
      if (!mapRef.current || mapInstanceRef.current || !window.L) return
      const L = window.L
      const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 16)
      mapInstanceRef.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
      }).addTo(map)
      map.on('dragstart', () => {
        followRef.current = false
        setFollowing(false)
      })
      const van = L.marker([lat, lng], {
        icon: L.divIcon({ html: VAN_HTML, className: 'gw-van-icon', iconSize: [34, 42], iconAnchor: [17, 21] }),
        zIndexOffset: 1000,
      }).addTo(map)
      vanRef.current = van
      curRef.current = [lat, lng]
      if (destRef2.current) drawDest(destRef2.current)
    }

    function drawDest(d: LatLng) {
      const L = window.L
      if (!mapInstanceRef.current || !L) return
      if (!destRef.current) {
        destRef.current = L.marker(d, {
          icon: L.divIcon({
            html: '<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:#F5C518;transform:rotate(-45deg);border:2px solid #0B0F17;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>',
            className: 'gw-dest-icon',
            iconSize: [18, 18],
            iconAnchor: [9, 18],
          }),
        }).addTo(mapInstanceRef.current)
      }
    }

    async function refreshRoute(from: LatLng) {
      const d = destRef2.current
      if (!d) return
      const now = Date.now()
      if (now - lastRouteAt.current < 12000) return
      lastRouteAt.current = now
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`
        const res = await fetch(url)
        const json = await res.json()
        const route = json?.routes?.[0]
        const L = window.L
        if (route && mapInstanceRef.current && L) {
          const coords: LatLng[] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
          if (routeRef.current) mapInstanceRef.current.removeLayer(routeRef.current)
          routeRef.current = L.polyline(coords, { color: '#F5C518', weight: 5, opacity: 0.85 }).addTo(mapInstanceRef.current)
          const mins = Math.max(1, Math.round(route.duration / 60))
          const miles = route.distance / 1609.34
          setEta(`${mins} min`)
          setDist(`${miles.toFixed(1)} mi away`)
        }
      } catch {
        const L = window.L
        if (mapInstanceRef.current && L && d) {
          if (routeRef.current) mapInstanceRef.current.removeLayer(routeRef.current)
          routeRef.current = L.polyline([from, d], { color: '#F5C518', weight: 4, opacity: 0.6, dashArray: '6 8' }).addTo(mapInstanceRef.current)
          const miles = haversineMeters(from, d) / 1609.34
          setDist(`${miles.toFixed(1)} mi away`)
        }
      }
    }

    function animateTo(target: LatLng) {
      if (!vanRef.current) return
      const start = curRef.current || target
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (haversineMeters(start, target) > 1) rotateVan(bearing(start, target))
      const t0 = performance.now()
      const dur = 1400
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur)
        const lat = start[0] + (target[0] - start[0]) * k
        const lng = start[1] + (target[1] - start[1]) * k
        vanRef.current.setLatLng([lat, lng])
        if (followRef.current && mapInstanceRef.current) mapInstanceRef.current.panTo([lat, lng], { animate: false })
        if (k < 1) rafRef.current = requestAnimationFrame(step)
        else curRef.current = target
      }
      rafRef.current = requestAnimationFrame(step)
    }

    async function onFix(lat: number, lng: number) {
      setWaiting(false)
      if (!leafletLoaded) {
        await loadLeaflet()
        leafletLoaded = true
      }
      if (!mapInstanceRef.current) initMap(lat, lng)
      else animateTo([lat, lng])
      setLastUpdate(new Date().toLocaleTimeString())
      refreshRoute([lat, lng])
    }

    async function init() {
      try {
        // Curated destination and Pro name (safe public fields).
        try {
          const { data: { session } } = await supabase.auth.getSession()
          setSignedIn(!!session?.access_token)
          const headers: Record<string, string> = {}
          if (session?.access_token) headers['Authorization'] = 'Bearer ' + session.access_token
          const meta = await fetch(`/api/track/${jobId}`, { headers }).then((r) => r.json())
          if (meta?.ok) {
            if (meta.proName) setProName(meta.proName)
            if (meta.role) setRole(meta.role)
            if (meta.contactName) setContactName(meta.contactName)
            if (meta.customerName) setCustomerName(meta.customerName)
            if (meta.contactPhone) setContactPhone(meta.contactPhone)
            if (meta.destination) destRef2.current = [meta.destination.lat, meta.destination.lng]
          }
        } catch {}

        const { data } = await supabase
          .from('pro_locations')
          .select('id, lat, lng, updated_at')
          .eq('job_id', jobId)
          .maybeSingle()

        if (data) {
          await onFix(data.lat, data.lng)
          setLastUpdate(new Date(data.updated_at).toLocaleTimeString())
        }

        const channel = supabase
          .channel('pro-location-' + jobId)
          .on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'pro_locations', filter: `job_id=eq.${jobId}` },
            (p: any) => onFix(p.new.lat, p.new.lng))
          .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'pro_locations', filter: `job_id=eq.${jobId}` },
            (p: any) => onFix(p.new.lat, p.new.lng))
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
          if (rafRef.current) cancelAnimationFrame(rafRef.current)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
            vanRef.current = null
          }
        }
      } catch {
        setError('An unexpected error occurred.')
      }
    }

    const cleanup = init()
    return () => {
      cleanup.then((fn) => fn && fn())
    }
  }, [jobId])

  function recenter() {
    followRef.current = true
    setFollowing(true)
    const map = mapInstanceRef.current
    const L = window.L
    if (!map || !L) return
    if (curRef.current && destRef2.current) {
      map.fitBounds(L.latLngBounds([curRef.current, destRef2.current]).pad(0.25))
    } else if (curRef.current) {
      map.setView(curRef.current, 16)
    }
  }

  const telNum = (contactPhone || '').replace(/\s/g, '')

  return (
    <div className="flex flex-col h-screen bg-[#07090D]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0B0F17] flex-shrink-0" style={{ height: '56px' }}>
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
            {role === 'pro' ? 'Heading to ' + customerName : proName + ' is on the way'}
          </span>
          {signedIn && (
            <button onClick={() => setChatOpen(true)} aria-label="Open messages" className="ml-1 w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center active:scale-95 transition">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {waiting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#07090D]">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            <p className="text-white/40 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{role === 'pro' ? 'Waiting for your location...' : 'Waiting for ' + proName + ' to share location...'}</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#07090D]">
            <p className="text-red-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{error}</p>
          </div>
        )}

        <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

        {(eta || dist) && !waiting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0B0F17]/92 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
            {eta && <span className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{eta}</span>}
            {dist && <span className="text-white/55 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{dist}</span>}
          </div>
        )}

        {!following && !waiting && (
          <button onClick={recenter} className="absolute bottom-20 right-4 z-20 bg-[#0B0F17]/92 border border-white/10 rounded-full w-11 h-11 flex items-center justify-center shadow-xl active:scale-95 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
          </button>
        )}

        {lastUpdate && (
          <div className="absolute bottom-4 left-4 z-20 bg-[#0B0F17]/90 border border-white/8 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-white/40" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Updated {lastUpdate}</span>
          </div>
        )}
      </div>

      {contactPhone && !waiting && (
        <div className="flex-shrink-0 bg-[#0B0F17] border-t border-white/8 px-3 pt-3 pb-2 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(role === 'pro' ? PRO_PRIMARY : CUSTOMER_PRIMARY).map((p) => (
              <a key={p} href={`sms:${telNum}?body=${encodeURIComponent(p)}`}
                className="flex-shrink-0 text-xs text-white/80 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 active:scale-95 transition"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>{p}</a>
            ))}
            <button type="button" onClick={() => setShowMore((v) => !v)}
              className="flex-shrink-0 text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-3 py-1.5 active:scale-95 transition"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>{showMore ? 'Less' : 'More'}</button>
          </div>
          {showMore && (
            <div className="flex flex-wrap gap-2 pb-1">
              {(role === 'pro' ? PRO_MORE : CUSTOMER_MORE).map((p) => (
                <a key={p} href={`sms:${telNum}?body=${encodeURIComponent(p)}`}
                  className="text-xs text-white/80 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 active:scale-95 transition"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}>{p}</a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 min-w-0 bg-white/8 border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-yellow-400/40"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            />
            <a href={`sms:${telNum}?body=${encodeURIComponent(draft)}`}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-yellow-400 text-black rounded-xl active:scale-95 transition" aria-label={`Text ${contactName}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2-7-8-3z"/></svg>
            </a>
            <a href={`tel:${telNum}`}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-green-500 text-black rounded-xl active:scale-95 transition" aria-label={`Call ${contactName}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z"/></svg>
            </a>
          </div>
        </div>
      )}
      <footer className="flex items-center justify-center px-4 border-t border-white/6 bg-[#0B0F17] flex-shrink-0" style={{ height: '40px' }}>
        <span className="text-[11px] text-white/20" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Powered by GigWrench</span>
      </footer>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="relative h-[82vh] flex flex-col rounded-t-2xl overflow-hidden border-t border-white/10 shadow-2xl">
            <ChatThread jobId={jobId} onBack={() => setChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
