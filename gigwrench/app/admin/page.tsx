'use client'

import Link from 'next/link'
import { Users, UserPlus, BarChart3, Flag } from 'lucide-react'

const CARDS = [
  { href: '/admin/accounts', label: 'Accounts', icon: Users, desc: 'Search accounts, warn, suspend, disable, or restore.' },
  { href: '/admin/signups', label: 'Sign ups', icon: UserPlus, desc: 'Every registration, filterable, with export.' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, desc: 'Platform metrics and business intelligence.' },
  { href: '/admin/reports', label: 'Reports', icon: Flag, desc: 'Investigate reports and issue decisions.' },
]

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide mb-1">Admin</h1>
      <p className="text-white/40 text-sm mb-6">Operations, trust and safety, and platform intelligence.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {CARDS.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="block p-4 rounded-xl bg-[#0B0F17] border border-white/8 hover:border-yellow-400/30 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={15} className="text-yellow-400" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/80">{label}</span>
            </div>
            <p className="text-white/35 text-xs leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
