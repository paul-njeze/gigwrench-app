'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useLang } from '@/lib/lang'

import Link from 'next/link'

import { Plus, Search, X, Clock, CheckCircle2, FileText, ChevronRight } from 'lucide-react'

interface Invoice {

  id: string

  invoice_number: string

  status: string

  amount: number

  currency: string

  description: string | null

  issued_at: string

  due_at: string | null

  paid_at: string | null

  job_id: string | null

}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {

  draft:     { color: 'bg-white/8 text-white/40 border-white/10',           label: 'Draft' },

  sent:      { color: 'bg-blue-500/15 text-blue-400 border-blue-500/25',    label: 'Sent' },

  paid:      { color: 'bg-green-500/15 text-green-400 border-green-500/25', label: 'Paid' },

  overdue:   { color: 'bg-red-500/15 text-red-400 border-red-500/25',       label: 'Overdue' },

  cancelled: { color: 'bg-white/8 text-white/30 border-white/8',            label: 'Cancelled' },

}

function formatCurrency(amount: number, currency = 'USD'): string {

  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

}

function formatDate(iso: string): string {

  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

}

export default function InvoicesPage() {

  const { t } = useLang()

  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {

    async function load() {

      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase

        .from('invoices')

        .select('*')

        .eq('pro_id', user.id)

        .order('issued_at', { ascending: false })

      setInvoices(data || [])

      setLoading(false)

    }

    load()

  }, [])

  const filtered = invoices.filter(inv => {

    const matchSearch = !search ||

      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||

      (inv.description || '').toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || inv.status === statusFilter

    return matchSearch && matchStatus

  })

  const totals = {

    outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0),

    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),

    draft: invoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.amount, 0),

  }

  if (loading) return (

    <div className="flex items-center justify-center h-64">

      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>

    </div>

  )

  return (

    <div className="px-6 py-6 max-w-5xl mx-auto">

      <div className="flex items-start justify-between mb-6">

        <div>

          <h1 className="font-display text-4xl tracking-wider text-white">{t('invoices')}</h1>

          <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-widest">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</p>

        </div>

        <Link href="/invoices/new"

          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-display text-lg tracking-widest hover:bg-yellow-300 transition-colors no-underline">

          <Plus size={16}/>{t('new_invoice')}

        </Link>

      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">

        {[

          { label: 'Outstanding', value: formatCurrency(totals.outstanding), color: 'text-orange-400', bg: 'bg-orange-500/8', Icon: Clock },

          { label: 'Total Paid',  value: formatCurrency(totals.paid),        color: 'text-green-400',  bg: 'bg-green-500/8',  Icon: CheckCircle2 },

          { label: 'Draft',       value: formatCurrency(totals.draft),       color: 'text-white/40',   bg: 'bg-white/4',      Icon: FileText },

        ].map(({ label, value, color, bg, Icon }) => (

          <div key={label} className="bg-[#0B0F17] border border-white/6 rounded-xl p-4">

            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>

              <Icon size={15} className={color}/>

            </div>

            <div className={`font-display text-2xl tracking-wider ${color}`}>{value}</div>

            <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-1">{label}</div>

          </div>

        ))}

      </div>

      <div className="flex gap-2 mb-4">

        <div className="relative flex-1">

          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>

          <input

            type="text"

            value={search}

            onChange={e => setSearch(e.target.value)}

            placeholder="Search invoices..."

            className="w-full bg-[#0B0F17] border border-white/6 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/30 transition-colors placeholder:text-white/20 font-mono"

          />

          {search && (

            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">

              <X size={12}/>

            </button>

          )}

        </div>

      </div>

      <div className="flex gap-2 mb-5 flex-wrap">

        {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (

          <button key={s} onClick={() => setStatusFilter(s)}

            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${statusFilter === s ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-white/35 hover:border-white/20 hover:text-white/60'}`}>

            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}

          </button>

        ))}

      </div>

      {filtered.length === 0 ? (

        <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-12 text-center">

          <FileText size={32} className="text-white/15 mx-auto mb-3"/>

          <p className="text-white/30 text-sm font-mono">{search || statusFilter !== 'all' ? 'No invoices match your filters.' : 'No invoices yet. Create your first.'}</p>

          {!search && statusFilter === 'all' && (

            <Link href="/invoices/new" className="inline-flex items-center gap-2 mt-4 text-yellow-400 font-mono text-xs hover:text-yellow-300 transition-colors no-underline">

              <Plus size={12}/>{t('new_invoice')}

            </Link>

          )}

        </div>

      ) : (

        <div className="flex flex-col gap-2">

          {filtered.map(inv => {

            const isOverdue = inv.status === 'sent' && inv.due_at && new Date(inv.due_at) < new Date()

            const displayStatus = isOverdue ? 'overdue' : inv.status

            const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.draft

            return (

              <Link key={inv.id} href={`/invoices/${inv.id}`}

                className="bg-[#0B0F17] border border-white/6 rounded-xl p-4 hover:border-yellow-400/20 transition-all no-underline group flex items-center gap-4">

                <div className="w-10 h-10 bg-[#131C28] rounded-lg flex items-center justify-center flex-shrink-0">

                  <FileText size={15} className="text-white/30"/>

                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-1">

                    <span className="font-mono text-xs text-yellow-400/80">{inv.invoice_number}</span>

                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.color}`}>

                      {cfg.label}

                    </span>

                  </div>

                  <p className="text-white/60 text-sm truncate group-hover:text-white/80 transition-colors">

                    {inv.description || 'No description'}

                  </p>

                  <p className="font-mono text-[10px] text-white/25 mt-0.5">

                    Issued {formatDate(inv.issued_at)}

                    {inv.due_at && !inv.paid_at ? ` · Due ${formatDate(inv.due_at)}` : ''}

                    {inv.paid_at ? ` · Paid ${formatDate(inv.paid_at)}` : ''}

                  </p>

                </div>

                <div className="text-right flex-shrink-0">

                  <div className="font-display text-xl tracking-wider text-white group-hover:text-yellow-400 transition-colors">

                    {formatCurrency(inv.amount, inv.currency)}

                  </div>

                  <ChevronRight size={14} className="text-white/20 mt-1 ml-auto"/>

                </div>

              </Link>

            )

          })}

        </div>

      )}

    </div>

  )

}
