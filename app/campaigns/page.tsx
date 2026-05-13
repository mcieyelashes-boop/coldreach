'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { storage } from '@/lib/storage'
import type { Campaign, Contact, Settings, Template } from '@/lib/types'

function CampaignsInner() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sendMsg, setSendMsg] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '',
    subject: searchParams.get('subject') || '',
    body: searchParams.get('body') || '',
    fromEmail: '',
    fromName: '',
    contactIds: [] as string[],
  })

  useEffect(() => {
    setCampaigns(storage.getCampaigns())
    setContacts(storage.getContacts().filter(c => c.status === 'active'))
    setTemplates(storage.getTemplates())
    const s = storage.getSettings()
    setSettings(s)
    setForm(f => ({ ...f, fromEmail: s.senderEmail, fromName: s.senderName }))
    if (searchParams.get('subject') || searchParams.get('body')) setShowNew(true)
  }, [searchParams])

  function createCampaign() {
    if (!form.name || !form.subject || !form.body) return
    const c: Campaign = {
      id: crypto.randomUUID(),
      name: form.name,
      subject: form.subject,
      body: form.body,
      fromEmail: form.fromEmail,
      fromName: form.fromName,
      contactIds: form.contactIds,
      status: 'draft',
      stats: { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 },
      createdAt: new Date().toISOString(),
    }
    storage.saveCampaign(c)
    setCampaigns(storage.getCampaigns())
    setForm({ name: '', subject: '', body: '', fromEmail: settings?.senderEmail || '', fromName: settings?.senderName || '', contactIds: [] })
    setShowNew(false)
  }

  async function sendCampaign(id: string) {
    const c = campaigns.find(x => x.id === id)
    if (!c || !settings) return
    if (!settings.gmailEmail || !settings.gmailAppPassword) {
      setSendMsg({ ...sendMsg, [id]: 'Gmail credentials not set — go to Settings' })
      return
    }
    if (c.contactIds.length === 0) {
      setSendMsg({ ...sendMsg, [id]: 'No contacts selected for this campaign' })
      return
    }
    setSending(id)
    setSendMsg({ ...sendMsg, [id]: '' })

    const selectedContacts = contacts.filter(ct => c.contactIds.includes(ct.id))

    try {
      const res = await fetch('/api/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmailEmail: settings.gmailEmail,
          gmailAppPassword: settings.gmailAppPassword,
          fromName: c.fromName || settings.senderName,
          campaign: {
            subject: c.subject,
            body: c.body,
          },
          contacts: selectedContacts,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated: Campaign = {
        ...c,
        status: 'sent',
        sentAt: new Date().toISOString(),
        stats: { ...c.stats, sent: data.sent || selectedContacts.length },
      }
      storage.saveCampaign(updated)
      setCampaigns(storage.getCampaigns())
      setSendMsg({ ...sendMsg, [id]: `✓ Sent to ${data.sent} contacts` })
    } catch (e: unknown) {
      setSendMsg({ ...sendMsg, [id]: `Error: ${e instanceof Error ? e.message : 'Unknown error'}` })
    } finally {
      setSending(null)
    }
  }

  function loadTemplate(templateId: string) {
    const t = templates.find(x => x.id === templateId)
    if (t) setForm(f => ({ ...f, subject: t.subject, body: t.body }))
  }

  const toggleContact = (id: string) => {
    setForm(f => ({
      ...f,
      contactIds: f.contactIds.includes(id) ? f.contactIds.filter(x => x !== id) : [...f.contactIds, id],
    }))
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">{campaigns.length} campaigns</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Create Campaign</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. SaaS Founder Outreach May 2025"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">From Name</label>
              <input value={form.fromName} onChange={e => setForm(f => ({ ...f, fromName: e.target.value }))}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Load from Template</label>
              <select onChange={e => loadTemplate(e.target.value)} defaultValue=""
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">— Select template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Line</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Email subject..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Body</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={6} placeholder="Email body..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Select Contacts ({form.contactIds.length} selected)
              </label>
              {contacts.length === 0 ? (
                <p className="text-sm text-slate-400">No contacts yet. <a href="/integrations" className="text-indigo-500 hover:underline">Import some →</a></p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {contacts.map(c => (
                    <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={form.contactIds.includes(c.id)} onChange={() => toggleContact(c.id)} className="rounded" />
                      <span className="text-sm text-slate-700">{c.firstName} {c.lastName} <span className="text-slate-400">&lt;{c.email}&gt;</span></span>
                      {c.company && <span className="text-xs text-slate-400">· {c.company}</span>}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setForm(f => ({ ...f, contactIds: contacts.map(c => c.id) }))}
                  className="text-xs text-indigo-500 hover:underline">Select all</button>
                <span className="text-xs text-slate-300">|</span>
                <button onClick={() => setForm(f => ({ ...f, contactIds: [] }))}
                  className="text-xs text-slate-500 hover:underline">Clear</button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={createCampaign}
              disabled={!form.name || !form.subject || !form.body}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors">
              Save as Draft
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
              Cancel
            </button>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">Create your first campaign to start sending</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">Subject: <span className="text-slate-700">{c.subject}</span></p>
                  <p className="text-xs text-slate-400 mt-1">{c.contactIds.length} contacts · Created {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                {c.status === 'draft' && (
                  <button
                    onClick={() => sendCampaign(c.id)}
                    disabled={sending === c.id}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {sending === c.id ? <><span className="animate-spin">⟳</span> Sending...</> : '▶ Send Now'}
                  </button>
                )}
              </div>
              {c.status === 'sent' && (
                <div className="mt-3 flex gap-4 text-sm pt-3 border-t border-slate-100">
                  <span className="text-slate-500">Sent: <strong>{c.stats.sent}</strong></span>
                  <span className="text-slate-500">Opened: <strong>{c.stats.opened}</strong></span>
                  <span className="text-slate-500">Replied: <strong>{c.stats.replied}</strong></span>
                  <span className="text-slate-500">Bounced: <strong>{c.stats.bounced}</strong></span>
                </div>
              )}
              {sendMsg[c.id] && (
                <p className={`mt-2 text-sm ${sendMsg[c.id].startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {sendMsg[c.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense>
      <CampaignsInner />
    </Suspense>
  )
}
