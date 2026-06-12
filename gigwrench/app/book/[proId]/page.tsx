'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Copy, Check } from 'lucide-react'

type Stage = 1 | 2 | 3 | 4 | 5 | 6

interface ConversationTurn {
  role: 'dispatch' | 'customer'
  content: string
}

interface Slot {
  iso: string
  label: string
}

interface UploadedAttachment {
  id: string
  type: 'image' | 'video' | 'voice'
  name: string
}

interface ProProfile {
  full_name: string
  trade?: string
}

export default function BookPage() {
  const params = useParams()
  const proId = params?.proId as string

  const [stage, setStage] = useState<Stage>(1)
  const [proProfile, setProProfile] = useState<ProProfile | null>(null)
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  const [customerMessage, setCustomerMessage] = useState('')
  const [dispatchThinking, setDispatchThinking] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [workOrderSummary, setWorkOrderSummary] = useState('')
  const [editableSummary, setEditableSummary] = useState('')
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [stage1Done, setStage1Done] = useState(false)
  const conversationEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!proId) return
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('full_name, trade')
      .eq('id', proId)
      .single()
      .then(({ data }) => {
        if (data) setProProfile(data)
      })
  }, [proId])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, dispatchThinking])

  // Stage 1: send first message and create booking_requests row
  const handleSendMessage = async () => {
    if (!customerMessage.trim()) return
    if (!stage1Done && (!customerName || !customerEmail)) return

    const newTurn: ConversationTurn = { role: 'customer', content: customerMessage }
    const updatedHistory = [...conversationHistory, newTurn]
    setConversationHistory(updatedHistory)
    setCustomerMessage('')
    setDispatchThinking(true)

    try {
      let brid = bookingRequestId

      // Create booking_requests row on first message
      if (!brid) {
        const res = await fetch('/api/dispatch/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pro_id: proId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            job_description: customerMessage,
          }),
        })
        const data = await res.json() as { booking_request_id?: string }
        if (data.booking_request_id) {
          brid = data.booking_request_id
          setBookingRequestId(brid)
          setStage1Done(true)
        }
      }

      // Get Dispatch response
      const chatRes = await fetch('/api/dispatch/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_request_id: brid,
          message: customerMessage,
          conversation_history: conversationHistory.map((t) => ({ role: t.role === 'customer' ? 'user' : 'assistant', content: t.content })),
        }),
      })
      const chatData = await chatRes.json() as { response?: string }
      if (chatData.response) {
        setConversationHistory([...updatedHistory, { role: 'dispatch', content: chatData.response }])
      }
    } catch {
      // ignore
    } finally {
      setDispatchThinking(false)
    }
  }

  // Stage 2: upload image via Lens
  const handleImageUpload = async (files: FileList) => {
    if (!bookingRequestId) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        const lensRes = await fetch('/api/lens/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        const lensData = await lensRes.json()

        // Store in Supabase Storage
        const supabase = createClient()
        const path = `${bookingRequestId}/${file.name}`
        const { error: upErr } = await supabase.storage.from('dispatch-attachments').upload(path, file)
        if (upErr && !upErr.message.includes('already exists')) {
          // Create bucket if missing
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
            body: JSON.stringify({ name: 'dispatch-attachments', public: false }),
          })
          await supabase.storage.from('dispatch-attachments').upload(path, file)
        }

        // Insert dispatch_attachments record
        const { data: att } = await supabase.from('dispatch_attachments').insert({
          booking_request_id: bookingRequestId,
          attachment_type: 'image',
          storage_path: path,
          lens_analysis: lensData,
        }).select('id').single()

        if (att) {
          setAttachments((prev) => [...prev, { id: att.id, type: 'image', name: file.name }])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Stage 2: voice recording
  const handleVoiceRecord = async () => {
    try {
      if (isRecording) {
        mediaRecorderRef.current?.stop()
        setIsRecording(false)
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: 'audio/webm' })
        if (!bookingRequestId) return
        const supabase = createClient()
        const path = `${bookingRequestId}/voice-${Date.now()}.webm`
        await supabase.storage.from('dispatch-attachments').upload(path, blob)
        const { data: att } = await supabase.from('dispatch_attachments').insert({
          booking_request_id: bookingRequestId,
          attachment_type: 'voice',
          storage_path: path,
        }).select('id').single()
        if (att) {
          setAttachments((prev) => [...prev, { id: att.id, type: 'voice', name: 'Voice note' }])
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
          setIsRecording(false)
        }
      }, 120000)
    } catch {
      setVoiceError('Voice notes not supported on this browser. Please upload a photo instead.')
    }
  }

  // Stage 3: generate work order summary
  const generateSummary = async () => {
    if (!bookingRequestId) return
    setGeneratingSummary(true)
    try {
      const transcript = conversationHistory.map((t) => `${t.role}: ${t.content}`).join('\n')
      const attachmentSummary = attachments.map((a) => a.name).join(', ')
      const prompt = `Based on this service conversation and attachments, generate a plain-language work order summary with: Problem description, Visual findings (if any), Estimated job category, Recommended duration.\n\nConversation:\n${transcript}\n\nAttachments: ${attachmentSummary || 'None'}`

      const res = await fetch('/api/dispatch/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_request_id: bookingRequestId,
          message: prompt,
          conversation_history: [],
        }),
      })
      const data = await res.json() as { response?: string }
      const summary = data.response ?? 'Unable to generate summary. Please describe the job below.'
      setWorkOrderSummary(summary)
      setEditableSummary(summary)
    } catch {
      setEditableSummary('Please describe the job scope below.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  // Stage 4: load slots
  const loadSlots = async () => {
    if (!bookingRequestId) return
    setLoadingSlots(true)
    try {
      const res = await fetch('/api/dispatch/find-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_request_id: bookingRequestId,
          pro_id: proId,
          estimated_duration_hours: 2,
        }),
      })
      const data = await res.json() as { slots?: Array<{ iso: string; label: string }> }
      setSlots(data.slots ?? generateFallbackSlots())
    } catch {
      setSlots(generateFallbackSlots())
    } finally {
      setLoadingSlots(false)
    }
  }

  const generateFallbackSlots = (): Slot[] => {
    const now = new Date()
    return [1, 2, 3].map((offset) => {
      const d = new Date(now)
      d.setDate(d.getDate() + offset)
      d.setHours(10, 0, 0, 0)
      return {
        iso: d.toISOString(),
        label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at 10:00 AM',
      }
    })
  }

  // Stage 5: confirm booking
  const handleConfirmAndPay = async () => {
    if (!bookingRequestId || !selectedSlot || !termsAccepted) return
    setConfirming(true)
    try {
      let customerIp = ''
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipRes.json() as { ip: string }
        customerIp = ipData.ip
      } catch { /* ignore */ }

      const res = await fetch('/api/dispatch/intake-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_request_id: bookingRequestId,
          selected_slot: selectedSlot.iso,
          terms_accepted: true,
          customer_ip: customerIp,
          conversation_summary: editableSummary,
          attachment_ids: attachments.map((a) => a.id),
        }),
      })
      const data = await res.json() as { success?: boolean; job_id?: string }
      if (data.success) {
        setJobId(data.job_id ?? bookingRequestId)
        setStage(6)
      }
    } catch {
      // ignore
    } finally {
      setConfirming(false)
    }
  }

  const advanceStage = (next: Stage) => {
    if (next === 3) generateSummary()
    if (next === 4) loadSlots()
    setStage(next)
  }

  const stages = [
    { n: 1, label: 'Describe' },
    { n: 2, label: 'Evidence' },
    { n: 3, label: 'Scope' },
    { n: 4, label: 'Time' },
    { n: 5, label: 'Confirm' },
    { n: 6, label: 'Done' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-gw-bg)] text-[var(--color-gw-text)] flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-xl px-4 py-4 flex items-center justify-between border-b border-[var(--color-gw-bdr)]">
        <div>
          <span className="font-mono text-[var(--color-gw-accent)] font-bold text-lg">GigWrench</span>
          <span className="ml-2 text-[var(--color-gw-muted)] text-sm">Dispatch</span>
        </div>
        <div className="text-sm text-[var(--color-gw-muted)]">
          {proProfile ? `Book with ${proProfile.full_name}` : 'Loading...'}
        </div>
      </header>

      {/* Progress dots */}
      <div className="flex gap-2 py-4">
        {stages.map(({ n }) => (
          <div
            key={n}
            className={`w-3 h-3 rounded-full transition-all ${
              stage === n ? 'bg-[var(--color-gw-accent)]' : stage > n ? 'bg-[var(--color-gw-green)]' : 'bg-[var(--color-gw-sur2)]'
            }`}
          />
        ))}
      </div>

      <main className="w-full max-w-xl px-4 pb-24 flex-1">

        {/* STAGE 1: GREETING */}
        {stage === 1 && (
          <div>
            <div className="mb-4 p-4 rounded-xl bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-gw-accent)] text-black flex items-center justify-center text-xs font-bold flex-shrink-0">D</div>
                <p className="text-sm leading-relaxed">Hi! I'm Dispatch, your GigWrench AI booking agent. I'll help get the right Pro to you. First, tell me a bit about yourself and describe the problem you're experiencing.</p>
              </div>
            </div>

            {!stage1Done && (
              <div className="space-y-3 mb-4">
                <input
                  className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm outline-none focus:border-[var(--color-gw-accent)]"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm outline-none focus:border-[var(--color-gw-accent)]"
                  placeholder="Email address"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <input
                  className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm outline-none focus:border-[var(--color-gw-accent)]"
                  placeholder="Phone (optional)"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            )}

            {/* Conversation */}
            <div className="space-y-3 mb-4">
              {conversationHistory.map((turn, i) => (
                <div key={i} className={`flex ${turn.role === 'customer' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {turn.role === 'dispatch' && (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-gw-accent)] text-black flex items-center justify-center text-xs font-bold flex-shrink-0">D</div>
                  )}
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${turn.role === 'customer' ? 'bg-[var(--color-gw-blue)] text-white rounded-br-sm' : 'bg-[var(--color-gw-sur)] rounded-bl-sm'}`}>
                    {turn.content}
                  </div>
                </div>
              ))}
              {dispatchThinking && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-gw-accent)] text-black flex items-center justify-center text-xs font-bold">D</div>
                  <div className="px-4 py-2 rounded-2xl bg-[var(--color-gw-sur)] text-sm text-[var(--color-gw-muted)]">Dispatch is thinking...</div>
                </div>
              )}
              <div ref={conversationEndRef} />
            </div>

            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[48px] px-4 py-3 rounded-lg bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm outline-none focus:border-[var(--color-gw-accent)] resize-none"
                placeholder="Describe your problem..."
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!customerMessage.trim() || (!stage1Done && (!customerName || !customerEmail))}
                className="min-h-[48px] px-4 rounded-lg bg-[var(--color-gw-accent)] text-black font-bold text-sm disabled:opacity-40"
              >
                Send
              </button>
            </div>

            {conversationHistory.length >= 2 && (
              <button
                onClick={() => advanceStage(2)}
                className="w-full mt-4 min-h-[48px] rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm"
              >
                Continue to Evidence ->
              </button>
            )}
          </div>
        )}

        {/* STAGE 2: VISUAL EVIDENCE */}
        {stage === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-2">Add visual evidence</h2>
            <p className="text-[var(--color-gw-muted)] text-sm mb-6">Help Dispatch understand the problem. At least one photo is required.</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[64px] flex items-center gap-4 px-6 rounded-xl bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm font-medium"
              >
                <span className="text-xl">📷</span>
                Take Photos with Lens
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />

              <button
                onClick={() => {
                  const inp = document.createElement('input')
                  inp.type = 'file'
                  inp.accept = 'image/*'
                  inp.multiple = true
                  inp.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) handleImageUpload(files)
                  }
                  inp.click()
                }}
                className="w-full min-h-[64px] flex items-center gap-4 px-6 rounded-xl bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm font-medium"
              >
                <span className="text-xl">📤</span>
                Upload Photos
              </button>

              <button
                onClick={handleVoiceRecord}
                className={`w-full min-h-[64px] flex items-center gap-4 px-6 rounded-xl border text-sm font-medium ${isRecording ? 'bg-red-900 border-red-500' : 'bg-[var(--color-gw-sur)] border-[var(--color-gw-bdr)]'}`}
              >
                <span className="text-xl">🎙️</span>
                {isRecording ? 'Recording... tap to stop' : 'Record a Voice Note (max 2 min)'}
              </button>
            </div>

            {voiceError && <p className="text-red-400 text-xs mb-4">{voiceError}</p>}

            {attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 text-sm text-[var(--color-gw-muted)] bg-[var(--color-gw-sur)] px-4 py-2 rounded-lg">
                    <Check className="w-4 h-4 text-[var(--color-gw-green)]" />
                    {att.name}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => advanceStage(3)}
              disabled={attachments.length === 0}
              className="w-full min-h-[48px] rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm disabled:opacity-40"
            >
              Continue to Scope ->
            </button>
          </div>
        )}

        {/* STAGE 3: SCOPE CONFIRMATION */}
        {stage === 3 && (
          <div>
            <h2 className="text-lg font-bold mb-2">Confirm job scope</h2>
            <p className="text-[var(--color-gw-muted)] text-sm mb-4">Dispatch has reviewed your conversation and photos. Edit if needed.</p>

            {generatingSummary ? (
              <div className="py-8 text-center text-[var(--color-gw-muted)] text-sm">Dispatch is analysing...</div>
            ) : (
              <textarea
                value={editableSummary}
                onChange={(e) => setEditableSummary(e.target.value)}
                className="w-full min-h-[160px] px-4 py-3 rounded-xl bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] text-sm outline-none focus:border-[var(--color-gw-accent)] resize-none mb-4"
                placeholder="Job scope summary..."
              />
            )}

            <button
              onClick={() => advanceStage(4)}
              disabled={generatingSummary || !editableSummary.trim()}
              className="w-full min-h-[48px] rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm disabled:opacity-40"
            >
              Looks right ->
            </button>
          </div>
        )}

        {/* STAGE 4: SLOT SELECTION */}
        {stage === 4 && (
          <div>
            <h2 className="text-lg font-bold mb-2">Choose a time</h2>
            <p className="text-[var(--color-gw-muted)] text-sm mb-4">Select from the Pro's next available slots.</p>

            {loadingSlots ? (
              <div className="py-8 text-center text-[var(--color-gw-muted)] text-sm">Finding available times...</div>
            ) : (
              <div className="space-y-3 mb-4">
                {slots.map((slot) => (
                  <button
                    key={slot.iso}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full min-h-[64px] px-6 rounded-xl border text-sm font-medium text-left ${selectedSlot?.iso === slot.iso ? 'border-[var(--color-gw-accent)] bg-[var(--color-gw-accent)]/10' : 'border-[var(--color-gw-bdr)] bg-[var(--color-gw-sur)]'}`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={loadSlots}
              className="w-full min-h-[48px] rounded-xl border border-[var(--color-gw-bdr)] text-sm text-[var(--color-gw-muted)] mb-3"
            >
              Earlier or later?
            </button>

            <button
              onClick={() => advanceStage(5)}
              disabled={!selectedSlot}
              className="w-full min-h-[48px] rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm disabled:opacity-40"
            >
              Continue ->
            </button>
          </div>
        )}

        {/* STAGE 5: TERMS AND DEPOSIT */}
        {stage === 5 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Before you confirm</h2>

            <div className="bg-[var(--color-gw-sur)] border border-[var(--color-gw-bdr)] rounded-xl p-5 mb-4 text-sm leading-relaxed space-y-2 text-[var(--color-gw-muted)]">
              <p>By booking this appointment you agree to the following:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>A $50 Priority Hold is required to confirm your booking. This amount is applied toward your final invoice.</li>
                <li>If you cancel 12 or more hours before your appointment, you receive a 50% refund ($25). The Pro retains $20 and GigWrench retains $5.</li>
                <li>If you cancel less than 12 hours before your appointment or do not show up, the $50 is non-refundable. The Pro retains $40 and GigWrench retains $10.</li>
                <li>If your Pro cancels, you receive a full $50 refund automatically.</li>
                <li>If your Pro transfers this work order to another Pro, you will be notified and have 24 hours to accept or cancel with a full refund.</li>
                <li>GigWrench is a marketplace platform. The Pro is an independent contractor. GigWrench is not liable for the quality of work performed.</li>
                <li>By proceeding you confirm you are 18 years of age or older and have the authority to authorize work at the service address.</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[var(--color-gw-accent)]"
              />
              <span className="text-sm">I have read and agree to the terms above.</span>
            </label>

            <button
              onClick={handleConfirmAndPay}
              disabled={!termsAccepted || confirming}
              className="w-full min-h-[56px] rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm disabled:opacity-40"
            >
              {confirming ? 'Dispatch is securing your booking...' : 'Confirm and Pay $50'}
            </button>
          </div>
        )}

        {/* STAGE 6: CONFIRMATION */}
        {stage === 6 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-gw-green)] flex items-center justify-center text-white text-3xl mb-6">✓</div>
            <h2 className="text-2xl font-bold mb-2">Your booking is confirmed</h2>
            <p className="text-[var(--color-gw-muted)] text-sm mb-1">
              with {proProfile?.full_name ?? 'your Pro'}
            </p>
            {selectedSlot && (
              <p className="text-[var(--color-gw-muted)] text-sm mb-6">{selectedSlot.label}</p>
            )}
            <p className="text-sm mb-2">A confirmation SMS and email are on their way.</p>
            <p className="text-sm text-[var(--color-gw-muted)] mb-8">Your $50 Priority Hold payment link has been sent to your phone.</p>
            {jobId && (
              <a
                href={`/track/${jobId}`}
                className="w-full min-h-[56px] flex items-center justify-center rounded-xl bg-[var(--color-gw-accent)] text-black font-bold text-sm"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Track your Pro on the day
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[var(--color-gw-muted)] text-xs border-t border-[var(--color-gw-bdr)]">
        Powered by GigWrench. All rights reserved.
      </footer>
    </div>
  )
}
