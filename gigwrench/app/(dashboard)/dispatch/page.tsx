'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DispatchTestPanel from '@/components/DispatchTestPanel'

interface BookingRequest {
    id: string
    customer_name: string
    job_description: string
    status: string
    dispatch_slot_offered: string | null
    created_at: string
    customer_phone: string | null
    estimated_duration_hours: number | null
}

function formatSlot(iso: string): string {
    const d = new Date(iso)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let hours = d.getUTCHours()
    const minutes = d.getUTCMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()} at ${hours}:${minutes} ${ampm}`
}

const STATUS_CLASSES: Record<string, string> = {
    pending: 'bg-white/8 text-white/50 border border-white/10',
    slot_offered: 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/25',
    booked: 'bg-green-500/15 text-green-400 border border-green-500/25',
    declined: 'bg-red-500/15 text-red-400 border border-red-500/25',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/25',
}

function SkeletonCard() {
    return (
          <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 animate-pulse">
                <div className="h-4 w-40 bg-white/8 rounded mb-3"/>
                <div className="h-3 w-full bg-white/5 rounded mb-2"/>
                <div className="h-3 w-3/4 bg-white/5 rounded"/>
          </div>
        )
}

export default function DispatchPage() {
    const [requests, setRequests] = useState<BookingRequest[]>([])
        const [loading, setLoading] = useState(true)
            const [error, setError] = useState<string | null>(null)
                const [optimistic, setOptimistic] = useState<Record<string, string>>({})
                  
                    async function fetchRequests() {
                          setLoading(true)
                                setError(null)
                                      try {
                                              const supabase = createClient()
                                                      const { data: { user } } = await supabase.auth.getUser()
                                                              if (!user) { setError('Not signed in'); setLoading(false); return }
                                              const { data, error: dbErr } = await supabase
                                                        .from('booking_requests')
                                                        .select('*')
                                                        .eq('pro_id', user.id)
                                                        .order('created_at', { ascending: false })
                                                      if (dbErr) { setError(dbErr.message); setLoading(false); return }
                                              setRequests(data || [])
                                      } catch (e: unknown) {
                                              setError(e instanceof Error ? e.message : 'Failed to load requests')
                                      }
                          setLoading(false)
                    }
  
    useEffect(() => { fetchRequests() }, [])
      
        async function handleAction(command: 'BOOK' | 'DECLINE', requestId: string) {
              setOptimistic(prev => ({ ...prev, [requestId]: command === 'BOOK' ? 'booked' : 'declined' }))
                    try {
                            await fetch('/api/dispatch/sms-reply', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ command, booking_request_id: requestId }),
                            })
                                    await fetchRequests()
                    } catch {
                            setOptimistic(prev => { const next = { ...prev }; delete next[requestId]; return next })
                    }
        }
  
    return (
          <div className="min-h-screen bg-[#07090D] px-4 py-8 lg:px-8">
                <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                                  <h1 className="font-mono text-2xl uppercase tracking-widest text-white mb-2">Dispatch Inbox</h1>
                                  <p className="text-white/40 text-sm">Dispatch manages your bookings automatically. Review and act on requests below.</p>
                        </div>

                {/* Pro-side Dispatch test sandbox */}
                <DispatchTestPanel />
                  {loading && (
                      <div className="flex flex-col gap-3">
                                  <SkeletonCard/><SkeletonCard/><SkeletonCard/>
                      </div>
                        )}
                  {!loading && error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
                        )}
                  {!loading && !error && requests.length === 0 && (
                      <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-8 text-center">
                                  <p className="text-white/30 text-sm">No booking requests yet. Share your GigWrench profile link to start receiving requests through Dispatch.</p>
                      </div>
                        )}
                  {!loading && !error && requests.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {requests.map(req => {
                                      const status = optimistic[req.id] ?? req.status
                                                      const statusClass = STATUS_CLASSES[status] ?? STATUS_CLASSES.pending
                                                                      const canAct = status === 'slot_offered' || status === 'pending'
                                                                                      return (
                                                                                                        <div key={req.id} className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 transition-all">
                                                                                                                          <div className="flex items-start justify-between gap-3 mb-2">
                                                                                                                                              <span className="font-mono text-sm text-white font-medium">{req.customer_name}</span>
                                                                                                                                              <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${statusClass}`}>
                                                                                                                                                {status.replace(/_/g, ' ')}
                                                                                                                                                </span>
                                                                                                                            </div>
                                                                                                                          <p className="text-white/50 text-sm mb-3 leading-relaxed">{req.job_description}</p>
                                                                                                          {req.dispatch_slot_offered && (
                                                                                                                              <p className="font-mono text-xs text-white/30 mb-3">Slot offered: {formatSlot(req.dispatch_slot_offered)}</p>
                                                                                                                          )}
                                                                                                          {canAct && (
                                                                                                                              <div className="flex gap-2 mt-3">
                                                                                                                                                    <button
                                                                                                                                                                              onClick={() => handleAction('BOOK', req.id)}
                                                                                                                                                                              disabled={!!optimistic[req.id]}
                                                                                                                                                                              className="flex-1 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/25 text-yellow-400 font-mono text-xs uppercase tracking-widest px-3 py-2 rounded-lg transition-all disabled:opacity-40"
                                                                                                                                                                            >Book</button>
                                                                                                                                                    <button
                                                                                                                                                                              onClick={() => handleAction('DECLINE', req.id)}
                                                                                                                                                                              disabled={!!optimistic[req.id]}
                                                                                                                                                                              className="flex-1 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-widest px-3 py-2 rounded-lg transition-all disabled:opacity-40"
                                                                                                                                                                            >Decline</button>
                                                                                                                                </div>
                                                                                                                          )}
                                                                                                          </div>
                                                                                                      )
                        })}
                      </div>
                        )}
                </div>
          </div>
        )
}
