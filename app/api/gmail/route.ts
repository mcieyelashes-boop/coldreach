import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import type { Contact } from '@/lib/types'

function personalize(text: string, contact: Contact): string {
  return text
    .replace(/\{\{firstName\}\}/gi, contact.firstName || contact.email.split('@')[0])
    .replace(/\{\{lastName\}\}/gi, contact.lastName || '')
    .replace(/\{\{fullName\}\}/gi, [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email.split('@')[0])
    .replace(/\{\{company\}\}/gi, contact.company || 'your company')
    .replace(/\{\{title\}\}/gi, contact.title || 'your role')
    .replace(/\{\{email\}\}/gi, contact.email)
}

export async function POST(req: NextRequest) {
  const { gmailEmail, gmailAppPassword, fromName, campaign, contacts } = await req.json()

  if (!gmailEmail || !gmailAppPassword) {
    return NextResponse.json({ error: 'Gmail credentials required' }, { status: 400 })
  }
  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailEmail, pass: gmailAppPassword },
  })

  try {
    await transporter.verify()
  } catch {
    return NextResponse.json({ error: 'Gmail authentication failed. Check your email and App Password.' }, { status: 401 })
  }

  let sent = 0
  const errors: string[] = []

  for (const contact of contacts as Contact[]) {
    try {
      const subject = personalize(campaign.subject, contact)
      const text = personalize(campaign.body, contact)
      const html = text.replace(/\n/g, '<br>')

      await transporter.sendMail({
        from: fromName ? `"${fromName}" <${gmailEmail}>` : gmailEmail,
        to: contact.email,
        subject,
        text,
        html,
      })
      sent++

      // Small delay to avoid Gmail rate limiting
      await new Promise(r => setTimeout(r, 300))
    } catch (e: unknown) {
      errors.push(`${contact.email}: ${e instanceof Error ? e.message : 'failed'}`)
    }
  }

  return NextResponse.json({ sent, errors, total: contacts.length })
}
