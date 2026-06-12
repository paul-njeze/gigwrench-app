export const runtime = 'edge'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const SYSTEM_PROMPT = `You are Dispatch, the GigWrench AI booking agent. You are helping a customer describe a home service problem so the right Pro can be sent. Ask focused, practical questions one at a time. Keep responses under 3 sentences. Be warm but efficient. Do not mention pricing. Do not make promises about availability. Your goal is to understand: what is broken or needed, how urgent it is, and whether there are any access or safety considerations the Pro should know. Respond in the same language the customer is writing in.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      booking_request_id: string
      message: string
      conversation_history: Array<{ role: string; content: string }>
    }

    const { booking_request_id, message, conversation_history } = body

    if (!booking_request_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Build messages array from conversation history
    const messages = [
      ...(conversation_history || []).map((turn) => ({
        role: turn.role as 'user' | 'assistant',
        content: turn.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const requestBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'Anthropic API error: ' + errText }, { status: 500 })
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
    }

    const dispatchResponse = data.content.find((c) => c.type === 'text')?.text ?? ''

    // Store customer message and Dispatch response in dispatch_conversations
    const supabase = serviceClient()
    await supabase.from('dispatch_conversations').insert([
      { booking_request_id, role: 'customer', message },
      { booking_request_id, role: 'dispatch', message: dispatchResponse },
    ])

    return NextResponse.json({ response: dispatchResponse })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
