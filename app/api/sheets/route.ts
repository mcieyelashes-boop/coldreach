import { NextRequest, NextResponse } from 'next/server'
import type { Contact } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { sheetId, apiKey } = await req.json()
  if (!sheetId) return NextResponse.json({ error: 'Missing sheetId' }, { status: 400 })

  const range = 'A1:Z1000'
  const url = apiKey
    ? `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    : `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.message || 'Failed to fetch sheet'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const rows: string[][] = data.values || []
    if (rows.length < 2) return NextResponse.json({ contacts: [] })

    const headers = rows[0].map((h: string) => h.toLowerCase().trim())

    const col = (row: string[], names: string[]): string => {
      for (const name of names) {
        const idx = headers.indexOf(name)
        if (idx >= 0 && row[idx]) return row[idx].trim()
      }
      return ''
    }

    const contacts: Contact[] = rows.slice(1)
      .filter(row => {
        const email = col(row, ['email', 'e-mail', 'email address'])
        return email && email.includes('@')
      })
      .map(row => ({
        id: crypto.randomUUID(),
        email: col(row, ['email', 'e-mail', 'email address']).toLowerCase(),
        firstName: col(row, ['first_name', 'firstname', 'first name', 'given name']),
        lastName: col(row, ['last_name', 'lastname', 'last name', 'surname']),
        company: col(row, ['company', 'organization', 'org', 'company name']),
        title: col(row, ['title', 'job_title', 'job title', 'position', 'role']),
        phone: col(row, ['phone', 'phone_number', 'mobile', 'tel']),
        source: 'google_sheets' as const,
        tags: [],
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      }))

    return NextResponse.json({ contacts })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
