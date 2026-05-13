import type { Contact, Campaign, Template, Settings } from './types'

const KEYS = {
  contacts: 'cc_contacts',
  campaigns: 'cc_campaigns',
  templates: 'cc_templates',
  settings: 'cc_settings',
}

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getContacts: (): Contact[] => get(KEYS.contacts, []),
  setContacts: (v: Contact[]) => set(KEYS.contacts, v),
  addContacts: (newOnes: Contact[]) => {
    const existing = storage.getContacts()
    const merged = [...existing]
    for (const c of newOnes) {
      if (!merged.find(e => e.email === c.email)) merged.push(c)
    }
    set(KEYS.contacts, merged)
    return merged
  },

  getCampaigns: (): Campaign[] => get(KEYS.campaigns, []),
  setCampaigns: (v: Campaign[]) => set(KEYS.campaigns, v),
  saveCampaign: (c: Campaign) => {
    const all = storage.getCampaigns()
    const idx = all.findIndex(x => x.id === c.id)
    if (idx >= 0) all[idx] = c
    else all.unshift(c)
    set(KEYS.campaigns, all)
  },

  getTemplates: (): Template[] => get(KEYS.templates, []),
  setTemplates: (v: Template[]) => set(KEYS.templates, v),
  saveTemplate: (t: Template) => {
    const all = storage.getTemplates()
    const idx = all.findIndex(x => x.id === t.id)
    if (idx >= 0) all[idx] = t
    else all.unshift(t)
    set(KEYS.templates, all)
  },

  getSettings: (): Settings => get(KEYS.settings, {
    googleSheetsApiKey: '',
    hubspotApiToken: '',
    gmailEmail: '',
    gmailAppPassword: '',
    grokApiKey: '',
    claudeApiKey: '',
    aiProvider: 'claude',
    senderName: '',
    senderEmail: '',
  }),
  setSettings: (v: Settings) => set(KEYS.settings, v),
}
