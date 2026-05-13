'use client'
import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Campaign, Contact } from '@/lib/types'

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    setContacts(storage.getContacts())
    setCampaigns(storage.getCampaigns())
  }, [])

  const totalSent = campaigns.reduce((s, c) => s + c.stats.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.stats.opened, 0)
  const totalReplied = campaigns.reduce((s, c) => s + c.stats.replied, 0)
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0

  const recentCampaigns = campaigns.slice(0, 5)

  const stats = [
    { label: 'Total Contacts', value: contacts.length, color: 'indigo', sub: 'in your list' },
    { label: 'Emails Sent', value: totalSent, color: 'blue', sub: 'across all campaigns' },
    { label: 'Open Rate', value: `${openRate}%`, color: 'emerald', sub: `${totalOpened} opened` },
    { label: 'Reply Rate', value: `${replyRate}%`, color: 'violet', sub: `${totalReplied} replied` },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Your cold campaign overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Campaigns</h2>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">◈</p>
              <p className="text-sm">No campaigns yet</p>
              <a href="/campaigns" className="text-indigo-500 text-sm hover:underline mt-1 block">Create your first campaign →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.contactIds.length} contacts</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/integrations', icon: '⟷', label: 'Connect Data Source', desc: 'Import from Google Sheets, HubSpot, or CSV' },
              { href: '/compose', icon: '✦', label: 'Compose with AI', desc: 'Generate cold emails using Grok or Claude' },
              { href: '/campaigns', icon: '◈', label: 'Launch Campaign', desc: 'Send emails to your contact list' },
              { href: '/templates', icon: '☐', label: 'Browse Templates', desc: 'Use or create reusable email templates' },
            ].map(a => (
              <a key={a.href} href={a.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                <span className="text-xl text-indigo-500 mt-0.5">{a.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{a.label}</p>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
