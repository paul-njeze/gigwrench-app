export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

export interface LensResult {
  part_name: string
  use_case: string
  price_range: string
  suppliers: Array<{ name: string; reason: string }>
  recommendation: string
}h

const SYSTEM_PROMPT =
  'You are an expert tradesperson parts identifier. ' +
  'When given an image of a part, tool, or material, respond with ONLY a valid JSON object. ' +
  'No preamble, no markdown fences, no extra text before or after the JSON. ' +
  'The JSON must have exactly these keys: ' +
  'part_name (string), use_case (string), price_range (string, e.g. "$10 - $25"), ' +
  'suppliers (array of exactly 2 objects each with name and reason strings), ' +
  'recommendation (string).'

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json() as {
      image: string
      mimeType: string
    }

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const validMime = (mimeType === 'image/jpeg' || mimeType === 'image/png' ||
      mimeType === 'image/gif' || mimeType === 'image/webp')
      ? mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      : 'image/jpeg'

    const requestBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: validMime,
                data: image,
              },
            },
            {
              type: 'text',
              text: 'Identify this part or material. Return only the JSON object as instructed.',
            },
          ],
        },
      ],
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

    const rawText = data.content.find((c) => c.type === 'text')?.text ?? ''

    let result: LensResult
    try {
      result = JSON.parse(rawText) as LensResult
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse model response: ' + rawText },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
