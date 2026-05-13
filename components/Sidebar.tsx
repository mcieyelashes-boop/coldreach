'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/',             label: 'Dashboard',    icon: '▣' },
  { href: '/integrations', label: 'Integrations', icon: '⟷' },
  { href: '/contacts',     label: 'Contacts',     icon: '◎' },
  { href: '/compose',      label: 'Compose',      icon: '✦' },
  { href: '/campaigns',    label: 'Campaigns',    icon: '◈' },
  { href: '/analytics',    label: 'Analytics',    icon: '↗' },
  { href: '/templates',    label: 'Templates',    icon: '☐' },
  { href: '/settings',     label: 'Settings',     icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const current = nav.find(n => n.href === pathname)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">✉</span>
          <span className="font-bold text-sm">ColdReach</span>
          {current && <span className="text-slate-400 text-sm">/ {current.label}</span>}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-xl">✉</span>
            <h1 className="text-lg font-bold">ColdReach</h1>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">v1.0.0</p>
        </div>
      </div>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-56 min-h-screen bg-slate-900 text-white flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-xl">✉</span>
            <h1 className="text-lg font-bold tracking-tight">ColdReach</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cold Email Platform</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
