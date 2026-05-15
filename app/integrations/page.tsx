'use client'
import { useState } from 'react'
import { storage } from '@/lib/storage'
import type { Contact } from '@/lib/types'
import Papa from 'papaparse'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function IntegrationsPage() {
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [sheetsApiKey, setSheetsApiKey] = useState('')
  const [sheetsStatus, setSheetsStatus] = useState<Status>('idle')
  const [sheetsMsg, setSheetsMsg] = useState('')

  const [csvStatus, setCsvStatus] = useState<Status>('idle')
  const [csvMsg, setCsvMsg] = useState('')

  function extractSheetId(url: string): string | null {
    const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return m ? m[1] : null
  }

  async function importGoogleSheets() {
    const sheetId = extractSheetId(sheetsUrl) || sheetsUrl
    if (!sheetId) { setSheetsMsg('Invalid Google Sheets URL'); setSheetsStatus('error'); return }
    setSheetsStatus('loading')
    setSheetsMsg('')
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, apiKey: sheetsApiKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sheet')
      const added = storage.addContacts(data.contacts)
      setSheetsStatus('success')
      setSheetsMsg(`Imported ${data.contacts.length} contacts (${added.length} total in list)`)
    } catch (e: unknown) {
      setSheetsStatus('error')
      setSheetsMsg(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvStatus('loading')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[]
        const contacts: Contact[] = rows
          .filter(r => r.email || r.Email || r.EMAIL)
          .map(r => ({
            id: crypto.randomUUID(),
            email: (r.email || r.Email || r.EMAIL || '').trim().toLowerCase(),
            firstName: r.first_name || r.firstName || r['First Name'] || '',
            lastName: r.last_name || r.lastName || r['Last Name'] || '',
            company: r.company || r.Company || '',
            title: r.title || r.Title || r.job_title || '',
            phone: r.phone || r.Phone || '',
            source: 'csv',
            tags: [],
            status: 'active',
            createdAt: new Date().toISOString(),
          }))
        storage.addContacts(contacts)
        setCsvStatus('success')
        setCsvMsg(`Imported ${contacts.length} contacts from CSV`)
      },
      error: () => {
        setCsvStatus('error')
        setCsvMsg('Failed to parse CSV file')
      },
    })
  }

  const StatusBadge = ({ status, msg }: { status: Status; msg: string }) => {
    if (status === 'idle') return null
    const colors = {
      loading: 'bg-blue-50 text-blue-700 border-blue-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      error: 'bg-red-50 text-red-700 border-red-200',
    }
    return (
      <div className={`mt-3 p-3 rounded-lg border text-sm ${colors[status]}`}>
        {status === 'loading' ? '⟳ Importing...' : msg}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-1">Connect your data sources to import contacts</p>
      </div>

      <div className="space-y-6">
        {/* Google Sheets */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">📊</div>
            <div>
              <h2 className="font-semibold text-slate-800">Google Sheets</h2>
              <p className="text-xs text-slate-500">Import contacts from a spreadsheet</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sheet URL</label>
              <input
                value={sheetsUrl}
                onChange={e => setSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Google API Key <span className="text-slate-400">(untuk private sheet)</span>
              </label>
              <input
                value={sheetsApiKey}
                onChange={e => setSheetsApiKey(e.target.value)}
                placeholder="AIza..."
                type="password"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Kolom yang dikenali: <code className="bg-slate-100 px-1 rounded">email</code>, <code className="bg-slate-100 px-1 rounded">first_name</code>, <code className="bg-slate-100 px-1 rounded">last_name</code>, <code className="bg-slate-100 px-1 rounded">company</code>, <code className="bg-slate-100 px-1 rounded">title</code>
            </p>
            <button
              onClick={importGoogleSheets}
              disabled={sheetsStatus === 'loading'}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {sheetsStatus === 'loading' ? 'Importing...' : 'Import Contacts'}
            </button>
          </div>
          <StatusBadge status={sheetsStatus} msg={sheetsMsg} />
        </div>

        {/* CSV Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">📁</div>
            <div>
              <h2 className="font-semibold text-slate-800">CSV Upload</h2>
              <p className="text-xs text-slate-500">Upload file CSV daftar kontak</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Wajib ada kolom: <code className="bg-slate-100 px-1 rounded">email</code>. Opsional: <code className="bg-slate-100 px-1 rounded">first_name</code>, <code className="bg-slate-100 px-1 rounded">last_name</code>, <code className="bg-slate-100 px-1 rounded">company</code>, <code className="bg-slate-100 px-1 rounded">title</code>
            </p>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <div className="text-center">
                <p className="text-sm text-slate-500">Klik untuk upload CSV</p>
                <p className="text-xs text-slate-400 mt-1">File .csv saja</p>
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            </label>
          </div>
          <StatusBadge status={csvStatus} msg={csvMsg} />
        </div>
      </div>
    </div>
  )
}
