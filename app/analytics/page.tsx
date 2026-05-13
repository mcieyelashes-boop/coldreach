'use client'
import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Campaign } from '@/lib/types'

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => { setCampaigns(storage.getCampaigns()) }, [])

  const sentCampaigns = campaigns.filter(c => c.status === 'sent' && c.stats.sent > 0)
  const totalSent = sentCampaigns.reduce((s, c) => s + c.stats.sent, 0)
  const totalOpened = sentCampaigns.reduce((s, c) => s + c.stats.opened, 0)
  const totalReplied = sentCampaigns.reduce((s, c) => s + c.stats.replied, 0)
  const totalBounced = sentCampaigns.reduce((s, c) => s + c.stats.bounced, 0)

  function pct(a: number, b: number) {
    return b > 0 ? `${Math.round((a / b) * 100)}%` : '—'
  }

  function Bar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-slate-500 w-8 text-right">{value}</span>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Performance across all sent campaigns</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Sent', value: totalSent, sub: `${sentCampaigns.length} campaigns`, color: 'text-indigo-600' },
          { label: 'Open Rate', value: pct(totalOpened, totalSent), sub: `${totalOpened} opened`, color: 'text-emerald-600' },
          { label: 'Reply Rate', value: pct(totalReplied, totalSent), sub: `${totalReplied} replied`, color: 'text-blue-600' },
          { label: 'Bounce Rate', value: pct(totalBounced, totalSent), sub: `${totalBounced} bounced`, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {sentCampaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <p className="text-4xl mb-3">↗</p>
          <p className="font-medium">No sent campaigns yet</p>
          <p className="text-sm mt-1">Stats will appear here once you send campaigns</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Campaign Performance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Sent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-48">Opens</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-48">Replies</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Open %</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Reply %</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {sentCampaigns.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-48">{c.subject}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{c.stats.sent}</td>
                  <td className="px-5 py-4">
                    <Bar value={c.stats.opened} max={c.stats.sent} color="bg-emerald-400" />
                  </td>
                  <td className="px-5 py-4">
                    <Bar value={c.stats.replied} max={c.stats.sent} color="bg-blue-400" />
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-emerald-600">{pct(c.stats.opened, c.stats.sent)}</td>
                  <td className="px-5 py-4 text-sm font-medium text-blue-600">{pct(c.stats.replied, c.stats.sent)}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
