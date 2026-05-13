'use client'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import type { Settings, Template } from '@/lib/types'

export default function ComposePage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // AI fields
  const [persona, setPersona] = useState('')
  const [product, setProduct] = useState('')
  const [goal, setGoal] = useState('book a 15-minute call')
  const [tone, setTone] = useState('professional')
  const [aiProvider, setAiProvider] = useState<'grok' | 'claude'>('claude')
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  const [saveName, setSaveName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = storage.getSettings()
    setSettings(s)
    setAiProvider(s.aiProvider || 'claude')
  }, [])

  async function generateEmail() {
    if (!settings) return
    const apiKey = aiProvider === 'grok' ? settings.grokApiKey : settings.claudeApiKey
    if (!apiKey) {
      setAiError(`No ${aiProvider === 'grok' ? 'Grok' : 'Claude'} API key set. Go to Settings to add it.`)
      return
    }
    setGenerating(true)
    setAiError('')
    const prompt = `Write a cold email for the following:

Target persona: ${persona || 'busy startup founder'}
Product/service: ${product || 'our solution'}
Goal: ${goal}
Tone: ${tone}

Output format — return EXACTLY:
SUBJECT: [subject line]
BODY:
[email body with personalization placeholders like {{firstName}}, {{company}}]

Rules:
- Keep it under 150 words
- No fluff, no filler phrases like "I hope this email finds you well"
- Clear value proposition in first 2 lines
- One specific CTA`

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, apiKey, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const text: string = data.content
      const subjectMatch = text.match(/SUBJECT:\s*(.+)/i)
      const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i)
      if (subjectMatch) setSubject(subjectMatch[1].trim())
      if (bodyMatch) setBody(bodyMatch[1].trim())
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  function saveAsTemplate() {
    if (!saveName || !subject || !body) return
    const t: Template = {
      id: crypto.randomUUID(),
      name: saveName,
      subject,
      body,
      tags: [],
      createdAt: new Date().toISOString(),
    }
    storage.saveTemplate(t)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaveName('')
  }

  function loadFromClipboard() {
    navigator.clipboard.readText().then(text => setBody(text)).catch(() => {})
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Compose</h1>
        <p className="text-slate-500 mt-1">AI-powered cold email writer</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* AI Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">✦ AI Email Generator</h2>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {(['claude', 'grok'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setAiProvider(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    aiProvider === p ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p === 'claude' ? 'Claude' : 'Grok'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Persona</label>
              <input
                value={persona}
                onChange={e => setPersona(e.target.value)}
                placeholder="e.g. VP of Sales at B2B SaaS companies"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Product / Service</label>
              <textarea
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="e.g. AI tool that reduces customer churn by 40%..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Goal</label>
              <input
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. book a 15-minute call"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tone</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="professional">Professional</option>
                <option value="casual and friendly">Casual & Friendly</option>
                <option value="direct and bold">Direct & Bold</option>
                <option value="consultative">Consultative</option>
                <option value="witty">Witty</option>
              </select>
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {aiError}
              </div>
            )}

            <button
              onClick={generateEmail}
              disabled={generating}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Generating with {aiProvider === 'claude' ? 'Claude' : 'Grok'}...
                </>
              ) : (
                `✦ Generate Email with ${aiProvider === 'claude' ? 'Claude' : 'Grok'}`
              )}
            </button>
          </div>
        </div>

        {/* Email Editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Email Editor</h2>
            <button onClick={loadFromClipboard} className="text-xs text-indigo-500 hover:underline">Paste from clipboard</button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Line</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter subject line..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email Body <span className="text-slate-400">— use {'{{firstName}}'}, {'{{company}}'} for personalization</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Start writing or generate with AI..."
                rows={14}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Template name..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveAsTemplate}
              disabled={!saveName || !subject || !body}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-40 transition-colors"
            >
              {saved ? '✓ Saved' : 'Save Template'}
            </button>
            <a
              href={`/campaigns?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className={`px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors ${!subject || !body ? 'opacity-40 pointer-events-none' : ''}`}
            >
              Use in Campaign →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
