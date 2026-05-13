import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { provider, apiKey, prompt } = await req.json()

  if (!apiKey) return NextResponse.json({ error: `No API key provided for ${provider}` }, { status: 400 })
  if (!prompt) return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })

  try {
    if (provider === 'grok') {
      // Grok uses OpenAI-compatible API
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cold email copywriter who writes concise, personalized, high-converting cold emails.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Grok API error')
      return NextResponse.json({ content: data.choices[0].message.content })
    } else {
      // Claude via Anthropic API
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: 'You are an expert cold email copywriter who writes concise, personalized, high-converting cold emails.',
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Claude API error')
      return NextResponse.json({ content: data.content[0].text })
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'AI generation failed' }, { status: 500 })
  }
}
