import { NextRequest, NextResponse } from 'next/server'
import type { Contact } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing HubSpot token' }, { status: 400 })

  try {
    const res = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname,company,jobtitle,phone',
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    )
    const data = await res.json()

    if (!res.ok) {
      const msg = data?.message || 'Failed to fetch HubSpot contacts'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const contacts: Contact[] = (data.results || [])
      .filter((r: Record<string, unknown>) => {
        const props = r.properties as Record<string, string>
        return props?.email
      })
      .map((r: Record<string, unknown>) => {
        const props = r.properties as Record<string, string>
        return {
          id: crypto.randomUUID(),
          email: (props.email || '').toLowerCase(),
          firstName: props.firstname || '',
          lastName: props.lastname || '',
          company: props.company || '',
          title: props.jobtitle || '',
          phone: props.phone || '',
          source: 'hubspot' as const,
          tags: [],
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        }
      })

    return NextResponse.json({ contacts })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
