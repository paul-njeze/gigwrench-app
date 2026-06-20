export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

// Same persona as the live Dispatch booking agent, run statelessly so a Pro can
// test how Dispatch responds without creating a booking request or writing any
// conversation rows. Nothing here is persisted or sent to a customer.
const SYSTEM_PROMPT = `You are Dispatch, the GigWrench AI booking agent. You are helping a customer describe a home service problem so the right Pro can be sent. Ask focused, practical questions one at a time. Keep responses under 3 sentences. Be warm but efficient. Do not mention pricing. Do not make promises about availability. Your goal is to understand: what is broken or needed, how urgent it is, and whether there are any access or safety considerations the Pro should know. Respond in the same language the customer is writing in.`

export async function POST(req: NextRequest) {
  try {
    const { message, conversation_history } = (await req.json()) as {
      message: string
      conversation_history?: Array<{ role: string; content: string }>
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const messages = [
      ...(conversation_history || []).map((turn) => ({
        role: turn.role as 'user' | 'assistant',
        content: turn.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: 'Anthropic API error: ' + errText }, { status: 500 })
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>
    }
    const reply = data.content.find((c) => c.type === 'text')?.text ?? ''
    return NextResponse.json({ response: reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
