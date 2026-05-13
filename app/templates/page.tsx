'use client'
import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Template } from '@/lib/types'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [preview, setPreview] = useState<Template | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', body: '', tags: '' })

  useEffect(() => { setTemplates(storage.getTemplates()) }, [])

  function saveTemplate() {
    if (!form.name || !form.subject || !form.body) return
    const t: Template = {
      id: crypto.randomUUID(),
      name: form.name,
      subject: form.subject,
      body: form.body,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }
    storage.saveTemplate(t)
    setTemplates(storage.getTemplates())
    setForm({ name: '', subject: '', body: '', tags: '' })
    setShowNew(false)
  }

  function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return
    const updated = templates.filter(t => t.id !== id)
    storage.setTemplates(updated)
    setTemplates(updated)
    if (preview?.id === id) setPreview(null)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500 mt-1">{templates.length} saved templates</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Template
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Create Template</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Template Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. SaaS Follow-up"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="saas, outreach, follow-up"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Line</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Subject..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Body</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={8} placeholder="Hi {{firstName}}, ..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono" />
            </div>
            <div className="flex gap-3">
              <button onClick={saveTemplate} disabled={!form.name || !form.subject || !form.body}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                Save Template
              </button>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <p className="text-4xl mb-3">☐</p>
          <p className="font-medium">No templates yet</p>
          <p className="text-sm mt-1">Create templates or save them from the Compose page</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {templates.map(t => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                preview?.id === t.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
              }`}
              onClick={() => setPreview(preview?.id === t.id ? null : t)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{t.name}</h3>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <a href={`/compose`} className="text-xs text-indigo-500 hover:underline">Edit</a>
                  <button onClick={() => deleteTemplate(t.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">Subject: {t.subject}</p>
              {t.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>

              {preview?.id === t.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {t.body}
                  </pre>
                  <a
                    href={`/campaigns?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(t.body)}`}
                    className="mt-3 inline-block px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Use in Campaign →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
