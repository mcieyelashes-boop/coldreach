'use client'
import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Contact } from '@/lib/types'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    setContacts(storage.getContacts())
  }, [])

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.email.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    const matchSource = sourceFilter === 'all' || c.source === sourceFilter
    return matchSearch && matchSource
  })

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(c => c.id)))
    }
  }

  function deleteSelected() {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} contacts?`)) return
    const remaining = contacts.filter(c => !selected.has(c.id))
    storage.setContacts(remaining)
    setContacts(remaining)
    setSelected(new Set())
  }

  function unsubscribeSelected() {
    const updated = contacts.map(c =>
      selected.has(c.id) ? { ...c, status: 'unsubscribed' as const } : c
    )
    storage.setContacts(updated)
    setContacts(updated)
    setSelected(new Set())
  }

  const sourceColors: Record<string, string> = {
    google_sheets: 'bg-green-100 text-green-700',
    hubspot: 'bg-orange-100 text-orange-700',
    csv: 'bg-slate-100 text-slate-600',
    manual: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">{contacts.length} total contacts</p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{selected.size} selected</span>
            <button onClick={unsubscribeSelected} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
              Unsubscribe
            </button>
            <button onClick={deleteSelected} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Sources</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="hubspot">HubSpot</option>
            <option value="csv">CSV</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">◎</p>
            <p className="font-medium">No contacts found</p>
            <a href="/integrations" className="text-indigo-500 text-sm hover:underline mt-1 block">
              Import contacts from Integrations →
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                    </p>
                    {c.title && <p className="text-xs text-slate-400">{c.title}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.company || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[c.source] || 'bg-slate-100 text-slate-600'}`}>
                      {c.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'unsubscribed' ? 'bg-slate-100 text-slate-600' :
                      'bg-red-100 text-red-700'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
