import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyPersonaSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return signature.includes(expected)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('persona-signature')
    const secret = process.env.PERSONA_WEBHOOK_SECRET!
    const valid = await verifyPersonaSignature(body, signature, secret)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    const event = JSON.parse(body)
    const inquiryId = event?.data?.id
    const userId = event?.data?.attributes?.['reference-id']
    const status = event?.data?.attributes?.status
    if (!userId || !inquiryId) {
      return NextResponse.json({ received: true })
    }
    const supabase = serviceClient()
    if (status === 'completed') {
      await supabase
        .from('pro_profiles')
        .update({
          id_verified: true,
          persona_inquiry_id: inquiryId,
        })
        .eq('id', userId)
      await supabase
        .from('customer_profiles')
        .update({ persona_inquiry_id: inquiryId } as never)
        .eq('id', userId)
    }
    if (status === 'failed' || status === 'expired') {
      await supabase
        .from('pro_profiles')
        .update({ id_verified: false, persona_inquiry_id: inquiryId })
        .eq('id', userId)
    }
    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
