// FILE: app/portal/invoices/page.tsx  (commit via GitHub Contents API, Rule 19, not the Chrome agent)
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/lang'
import { Clock, ExternalLink, Receipt } from 'lucide-react'

interface PortalInvoice {
  id: string
  invoice_number: string | null
  status: string
  amount: number | null
  currency: string | null
  description: string | null
  issued_at: string
  due_at: string | null
  paid_at: string | null
  stripe_payment_link: string | null
}

const OUTSTANDING = ['sent', 'overdue']

function money(amount: number | null, currency: string | null, lang: string): string {
  if (amount == null) return ''
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

function fdate(iso: string | null, lang: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang, { month: 'short', day: 'numeric', year: 'numeric' })
}

function InvoiceRow({ inv, paid }: { inv: PortalInvoice; paid: boolean }) {
  const { t, lang } = useLang()
  const amount = money(inv.amount, inv.currency, lang)
  const canPay = !paid && !!inv.stripe_payment_link
  return (
    <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {inv.invoice_number && (
              <span className="font-mono text-xs text-yellow-400/80">{inv.invoice_number}</span>
            )}
            {paid ? (
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/25">
                {t('cp_paid')}
              </span>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/25">
                {t('cp_outstanding')}
              </span>
            )}
          </div>
          {inv.description && (
            <p className="text-white/60 text-sm truncate">{inv.description}</p>
          )}
          <p className="font-mono text-[10px] text-white/25 mt-0.5 flex items-center gap-1">
            <Clock size={9} className="flex-shrink-0"/>
            {paid && inv.paid_at
              ? `${t('cp_paid')} ${fdate(inv.paid_at, lang)}`
              : inv.due_at
                ? `${t('cp_due')} ${fdate(inv.due_at, lang)}`
                : fdate(inv.issued_at, lang)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {amount && <div className="font-display text-xl tracking-wider text-white">{amount}</div>}
        </div>
      </div>
      {canPay && (
        <a href={inv.stripe_payment_link!} target="_blank" rel="noopener noreferrer"
          data-tour="tour-cp-pay"
          className="mt-3 flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-yellow-300 transition-colors no-underline">
          <ExternalLink size={13}/>{t('cp_pay')}
        </a>
      )}
    </div>
  )
}

export default function PortalInvoices() {
  const { t } = useLang()
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('invoices')
        .select('id, invoice_number, status, amount, currency, description, issued_at, due_at, paid_at, stripe_payment_link')
        .eq('customer_id', user.id)
        .order('issued_at', { ascending: false })
      setInvoices((data as unknown as PortalInvoice[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"/>
    </div>
  )

  const outstanding = invoices.filter(i => OUTSTANDING.includes(i.status))
  const paid = invoices.filter(i => i.status === 'paid')

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl tracking-wider text-white mb-8">{t('cp_invoices')}</h1>

      {outstanding.length === 0 && paid.length === 0 ? (
        <div className="bg-[#0B0F17] border border-white/6 border-dashed rounded-xl p-10 text-center">
          <Receipt size={28} className="text-white/15 mx-auto mb-3"/>
          <p className="text-white/30 text-sm font-mono">{t('cp_no_invoices')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {outstanding.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-3">{t('cp_outstanding')}</h2>
              <div className="flex flex-col gap-2">
                {outstanding.map(inv => <InvoiceRow key={inv.id} inv={inv} paid={false}/>)}
              </div>
            </section>
          )}
          {paid.length > 0 && (
            <section>
              <h2 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-3">{t('cp_paid')}</h2>
              <div className="flex flex-col gap-2">
                {paid.map(inv => <InvoiceRow key={inv.id} inv={inv} paid={true}/>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
