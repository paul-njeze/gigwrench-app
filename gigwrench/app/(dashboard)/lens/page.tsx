'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanSearch } from 'lucide-react'
import LensCapture, { type LensResult } from '@/components/lens/LensCapture'
import LensResultCard from '@/components/lens/LensResult'

export default function LensPage() {
  const router = useRouter()
  const [result, setResult] = useState<LensResult | null>(null)

  function handleAddToInvoice(item: { description: string; unit_price: number }) {
    try {
      sessionStorage.setItem('gw_lens_pending_item', JSON.stringify(item))
    } catch {}
    router.push('/invoices/new')
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
          <ScanSearch size={16} className="text-yellow-400" />
        </div>
        <h1 className="font-display text-2xl tracking-widest text-white">
          GIGWRENCH <span className="text-yellow-400">LENS</span>
        </h1>
      </div>
      <p className="text-white/50 text-sm font-mono mb-6 leading-relaxed">
        Point your camera at any part, tool, or material on a job. Lens identifies it, gives you pricing and supplier options, and lets you drop it straight onto an invoice.
      </p>

      <LensCapture onResult={setResult} />
      {result && <LensResultCard result={result} onAddToInvoice={handleAddToInvoice} />}
    </div>
  )
}
