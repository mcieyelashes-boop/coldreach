'use client'
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
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
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
  )
}
