'use client'
import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Settings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(storage.getSettings())
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(storage.getSettings()) }, [])

  function save() {
    storage.setSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function Field({ label, field, type = 'text', placeholder, hint }: {
    label: string
    field: keyof Settings
    type?: string
    placeholder?: string
    hint?: string
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
          type={type}
          value={String(settings[field])}
          onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your API keys and sender details</p>
      </div>

      <div className="space-y-6">
        {/* Sender Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Sender Identity</h2>
          <div className="space-y-4">
            <Field label="Your Name" field="senderName" placeholder="John Smith" />
            <Field label="Sender Email" field="senderEmail" placeholder="john@yourcompany.com" />
          </div>
        </div>

        {/* Gmail */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📧</span>
            <h2 className="font-semibold text-slate-800">Gmail (Send Emails)</h2>
          </div>
          <div className="space-y-4">
            <Field label="Gmail Address" field="gmailEmail" placeholder="you@gmail.com" />
            <Field
              label="App Password"
              field="gmailAppPassword"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              hint="Generate at myaccount.google.com → Security → 2-Step Verification → App passwords"
            />
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <strong>Setup:</strong> Enable 2-Step Verification on your Google account, then generate an App Password for &quot;Mail&quot;. Never use your actual Gmail password here.
          </div>
        </div>

        {/* Google Sheets */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <h2 className="font-semibold text-slate-800">Google Sheets API</h2>
          </div>
          <Field
            label="Google API Key"
            field="googleSheetsApiKey"
            type="password"
            placeholder="AIza..."
            hint="Create at console.cloud.google.com → APIs → Google Sheets API → Credentials"
          />
        </div>

        {/* AI Providers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✦</span>
            <h2 className="font-semibold text-slate-800">AI Providers</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default AI Provider</label>
              <div className="flex gap-3">
                {(['claude', 'grok'] as const).map(p => (
                  <label key={p} className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                    settings.aiProvider === p ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="aiProvider"
                      value={p}
                      checked={settings.aiProvider === p}
                      onChange={() => setSettings(s => ({ ...s, aiProvider: p }))}
                      className="text-indigo-600"
                    />
                    <span className="text-sm font-medium capitalize">{p === 'claude' ? 'Claude (Anthropic)' : 'Grok (xAI)'}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field
              label="Claude API Key"
              field="claudeApiKey"
              type="password"
              placeholder="sk-ant-..."
              hint="Get from console.anthropic.com"
            />
            <Field
              label="Grok API Key (xAI)"
              field="grokApiKey"
              type="password"
              placeholder="xai-..."
              hint="Get from console.x.ai"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={save}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
          {saved && <p className="text-sm text-emerald-600 font-medium">✓ Settings saved</p>}
        </div>
      </div>
    </div>
  )
}
