// gigwrench/lib/notify/email.ts
// Single Resend wrapper for all outbound email. Edge safe. Never throws into
// the caller: every failure is returned as a typed result so the orchestrator
// can record it without breaking the request it is part of.

export interface SendEmailParams {
  from: string
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  ok: boolean
  id: string | null
  error: string | null
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    return { ok: false, id: null, error: 'RESEND_API_KEY is not set' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return { ok: false, id: null, error: `Resend ${res.status}: ${text}` }
    }
    const data = (await res.json()) as { id?: string }
    return { ok: true, id: data.id ?? null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    return { ok: false, id: null, error: message }
  }
}
