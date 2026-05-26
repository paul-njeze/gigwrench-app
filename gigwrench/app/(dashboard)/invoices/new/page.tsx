'use client'

import { useState, useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

import { ArrowLeft, Plus, Trash2, Send, Save, Loader2 } from 'lucide-react'

interface LineItem {

  id: string

  description: string

  quantity: number

  unit_price: number

}

interface Job {

  id: string

  title: string

  scheduled_at: string

  quoted_amount: number | null

}

export default function NewInvoicePage() {

  const router = useRouter()

  const [jobs, setJobs] = useState<Job[]>([])

  const [selectedJob, setSelectedJob] = useState('')

  const [description, setDescription] = useState('')

  const [customerEmail, setCustomerEmail] = useState('')

  const [dueDate, setDueDate] = useState('')

  const [lineItems, setLineItems] = useState<LineItem[]>([

    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0 }

  ])

  const [saving, setSaving] = useState(false)

  const [sending, setSending] = useState(false)

  const [error, setError] = useState('')

  const total = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  useEffect(() => {

    async function load() {

      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase

        .from('jobs')

        .select('id, title, scheduled_at, quoted_amount')

        .eq('pro_id', user.id)

        .in('status', ['completed', 'in_progress'])

        .order('scheduled_at', { ascending: false })

        .limit(20)

      setJobs(data || [])

    }

    load()

  }, [])

  function addLine() {

    setLineItems(prev => [...prev, { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0 }])

  }

  function removeLine(id: string) {

    if (lineItems.length === 1) return

    setLineItems(prev => prev.filter(i => i.id !== id))

  }

  function updateLine(id: string, field: keyof LineItem, value: string | number) {

    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  }

  async function saveInvoice(andSend: boolean) {

    setError('')

    if (total <= 0) { setError('Total must be greater than zero.'); return }

    if (!description.trim()) { setError('Please add a description.'); return }

    andSend ? setSending(true) : setSaving(true)

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { setError('Not signed in.'); setSaving(false); setSending(false); return }

    const defaultDue = new Date()

    defaultDue.setDate(defaultDue.getDate() + 14)

    const { data: inv, error: dbErr } = await supabase.from('invoices').insert({

      pro_id: user.id,

      job_id: selectedJob || null,

      amount: total,

      currency: 'USD',

      description: description.trim(),

      status: 'draft',

      due_at: dueDate ? new Date(dueDate).toISOString() : defaultDue.toISOString(),

      line_items: lineItems.map(({ id: _id, ...rest }) => rest),

    }).select().single()

    if (dbErr || !inv) {

      setError('Failed to save invoice. Please try again.')

      setSaving(false); setSending(false)

      return

    }

    if (!andSend) {

      router.push(`/invoices/${inv.id}`)

      return

    }

    const res = await fetch('/api/invoices/create-payment-link', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        invoice_id: inv.id,

        amount: total,

        description: description.trim(),

        customer_email: customerEmail.trim() || null,

      }),

    })

    const result = await res.json()

    if (!res.ok) {

      setError(result.error || 'Failed to generate payment link.')

      setSending(false)

      return

    }

    router.push(`/invoices/${inv.id}?sent=true`)

  }

  return (

    <div className="px-6 py-6 max-w-3xl mx-auto">

      <Link href="/invoices" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors font-mono text-xs mb-6 no-underline">

        <ArrowLeft size={12}/> Back to invoices

      </Link>

      <h1 className="font-display text-4xl tracking-wider text-white mb-8">New Invoice.</h1>

      <div className="flex flex-col gap-5">

        <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 flex flex-col gap-4">

          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Invoice Details</p>

          <div className="flex flex-col gap-1.5">

            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Description <span className="text-yellow-400">*</span></label>

            <input type="text" value={description} onChange={e => setDescription(e.target.value)}

              placeholder="e.g. Boiler service and repair"

              className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"/>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="flex flex-col gap-1.5">

              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Customer Email</label>

              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}

                placeholder="customer@email.com"

                className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"/>

            </div>

            <div className="flex flex-col gap-1.5">

              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Due Date</label>

              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}

                className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors"/>

            </div>

          </div>

          {jobs.length > 0 && (

            <div className="flex flex-col gap-1.5">

              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Link to Job (optional)</label>

              <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}

                className="bg-[#131C28] border border-white/8 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors">

                <option value="">No job selected</option>

                {jobs.map(j => (

                  <option key={j.id} value={j.id}>

                    {j.title} -- {new Date(j.scheduled_at).toLocaleDateString()}

                    {j.quoted_amount ? ` (${j.quoted_amount})` : ''}

                  </option>

                ))}

              </select>

            </div>

          )}

        </div>

        <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">

          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">Line Items</p>

          <div className="flex flex-col gap-2 mb-3">

            {lineItems.map((item, idx) => (

              <div key={item.id} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">

                <input type="text" value={item.description} onChange={e => updateLine(item.id, 'description', e.target.value)}

                  placeholder={`Item ${idx + 1}`}

                  className="bg-[#131C28] border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors placeholder:text-white/20"/>

                <input type="number" value={item.quantity} onChange={e => updateLine(item.id, 'quantity', parseFloat(e.target.value) || 0)}

                  min="0" step="1" placeholder="Qty"

                  className="bg-[#131C28] border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors text-center"/>

                <input type="number" value={item.unit_price} onChange={e => updateLine(item.id, 'unit_price', parseFloat(e.target.value) || 0)}

                  min="0" step="0.01" placeholder="Price"

                  className="bg-[#131C28] border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400/40 transition-colors text-right"/>

                <button onClick={() => removeLine(item.id)} disabled={lineItems.length === 1}

                  className="w-9 h-9 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed">

                  <Trash2 size={13}/>

                </button>

              </div>

            ))}

          </div>

          <button onClick={addLine}

            className="flex items-center gap-2 text-white/30 hover:text-yellow-400 transition-colors font-mono text-xs">

            <Plus size={12}/> Add line item

          </button>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/6">

            <span className="font-mono text-xs text-white/40 uppercase tracking-widest">Total</span>

            <span className="font-display text-3xl tracking-wider text-white">${total.toFixed(2)}</span>

          </div>

        </div>

        {error && (

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">

            {error}

          </div>

        )}

        <div className="flex gap-3">

          <button onClick={() => saveInvoice(false)} disabled={saving || sending}

            className="flex items-center gap-2 bg-[#0B0F17] border border-white/10 text-white/60 px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-widest hover:border-white/25 hover:text-white transition-all disabled:opacity-40">

            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}

            Save Draft

          </button>

          <button onClick={() => saveInvoice(true)} disabled={saving || sending}

            className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-display text-xl tracking-widest hover:bg-yellow-300 transition-colors disabled:opacity-40 flex-1 justify-center">

            {sending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}

            Send and Get Paid

          </button>

        </div>

      </div>

    </div>

  )

}
