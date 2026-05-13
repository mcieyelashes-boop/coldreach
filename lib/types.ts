export interface Contact {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string
  title: string
  phone: string
  source: 'google_sheets' | 'hubspot' | 'csv' | 'manual'
  tags: string[]
  status: 'active' | 'unsubscribed' | 'bounced'
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  fromEmail: string
  fromName: string
  contactIds: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduledAt?: string
  sentAt?: string
  stats: {
    sent: number
    opened: number
    clicked: number
    replied: number
    bounced: number
  }
  createdAt: string
}

export interface Template {
  id: string
  name: string
  subject: string
  body: string
  tags: string[]
  createdAt: string
}

export interface Settings {
  googleSheetsApiKey: string
  hubspotApiToken: string
  gmailEmail: string
  gmailAppPassword: string
  grokApiKey: string
  claudeApiKey: string
  aiProvider: 'grok' | 'claude'
  senderName: string
  senderEmail: string
}
