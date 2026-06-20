// gigwrench/lib/notify/sms.ts
// Single Twilio wrapper. Edge safe via btoa. The SMS_ENABLED dark gate lives
// here and nowhere else, so SMS goes live in exactly one place once the A2P
// campaign clears. Until then every call returns a clean skipped result.

export type SmsStatus = 'sent' | 'failed' | 'skipped'

export interface SendSmsParams {
  to: string
  body: string
}

export interface SendSmsResult {
  status: SmsStatus
  id: string | null
  error: string | null
}

export function smsEnabled(): boolean {
  return process.env.SMS_ENABLED === 'true'
}

export async function sendSMS(params: SendSmsParams): Promise<SendSmsResult> {
  if (!smsEnabled()) {
    return { status: 'skipped', id: null, error: null }
  }
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    return { status: 'failed', id: null, error: 'Twilio env vars are not set' }
  }
  try {
    const auth = btoa(`${sid}:${token}`)
    const reqParams = new URLSearchParams({ From: from, To: params.to, Body: params.body })
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: reqParams.toString(),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      return { status: 'failed', id: null, error: `Twilio ${res.status}: ${text}` }
    }
    const data = (await res.json()) as { sid?: string }
    return { status: 'sent', id: data.sid ?? null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown SMS error'
    return { status: 'failed', id: null, error: message }
  }
}
