// gigwrench/lib/notify/index.ts
// The notification spine. Resolves recipient preferences, fires each channel
// through the shared email and SMS wrappers, and records every event in the
// notifications ledger. An optional unique dedupe key makes repeat events (a
// double tap, a retried request) a no op: nothing is inserted and nothing sends.
//
// Delivery is never blocked by the ledger. If the notifications table is missing
// or a write fails for any reason other than a dedupe collision, the channels
// still fire and the event simply goes unrecorded.

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from './email'
import { sendSMS } from './sms'

export type NotifyChannel = 'email' | 'sms'
export type NotifyStatus = 'sent' | 'failed' | 'skipped'

export interface NotifyEmail {
  from: string
  subject: string
  html: string
}

export interface NotifySms {
  body: string
}

export interface DispatchParams {
  recipientId?: string | null
  to: { email?: string | null; phone?: string | null }
  type: string
  email?: NotifyEmail
  sms?: NotifySms
  dedupeKey?: string | null
  critical?: boolean
  prefKeys?: { email?: string; sms?: string }
  prefs?: Record<string, boolean> | null
}

export interface ChannelResult {
  channel: NotifyChannel
  status: NotifyStatus
  id: string | null
  error: string | null
}

export interface DispatchResult {
  fired: string[]
  results: ChannelResult[]
  deduped: boolean
}

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Account critical messages always send. Otherwise a channel sends only when the
// recipient has not turned its preference off. Absent preference means opted in.
function allowed(channel: NotifyChannel, params: DispatchParams): boolean {
  if (params.critical) return true
  const key = params.prefKeys?.[channel]
  if (!key) return true
  const prefs = params.prefs ?? {}
  return prefs[key] !== false
}

export async function dispatch(params: DispatchParams): Promise<DispatchResult> {
  const supabase = serviceClient()
  const fired: string[] = []
  const results: ChannelResult[] = []

  // Open the ledger row first. With a dedupe key, a unique collision means the
  // event already fired, so we stop here and report deduped. We favour never
  // double sending over guaranteeing one send.
  let ledgerId: string | null = null
  const { data: inserted, error: insErr } = await supabase
    .from('notifications')
    .insert({
      recipient_id: params.recipientId ?? null,
      type: params.type,
      dedupe_key: params.dedupeKey ?? null,
      critical: params.critical ?? false,
      channels: [],
    })
    .select('id')
    .single()
  if (insErr) {
    if (params.dedupeKey && insErr.code === '23505') {
      return { fired: ['deduped'], results: [], deduped: true }
    }
    // Table missing or any other write error: proceed unrecorded.
    ledgerId = null
  } else {
    ledgerId = (inserted as { id: string }).id
  }

  // Email channel.
  if (params.email && params.to.email) {
    if (allowed('email', params)) {
      const r = await sendEmail({
        from: params.email.from,
        to: params.to.email,
        subject: params.email.subject,
        html: params.email.html,
      })
      const status: NotifyStatus = r.ok ? 'sent' : 'failed'
      results.push({ channel: 'email', status, id: r.id, error: r.error })
      fired.push(r.ok ? 'email_sent' : 'email_failed')
    } else {
      results.push({ channel: 'email', status: 'skipped', id: null, error: null })
      fired.push('email_skipped')
    }
  }

  // SMS channel. The dark gate lives inside sendSMS, which returns skipped while
  // SMS_ENABLED is not set to true.
  if (params.sms && params.to.phone) {
    if (allowed('sms', params)) {
      const r = await sendSMS({ to: params.to.phone, body: params.sms.body })
      results.push({ channel: 'sms', status: r.status, id: r.id, error: r.error })
      fired.push(`sms_${r.status}`)
    } else {
      results.push({ channel: 'sms', status: 'skipped', id: null, error: null })
      fired.push('sms_skipped')
    }
  }

  // Record outcomes. Best effort only.
  if (ledgerId) {
    try {
      await supabase
        .from('notifications')
        .update({ channels: results })
        .eq('id', ledgerId)
    } catch {
      // A ledger update failure must never affect what was already delivered.
    }
  }

  return { fired, results, deduped: false }
}
