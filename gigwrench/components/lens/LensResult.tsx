'use client'

import { useState } from 'react'
import { Wrench, CheckCircle } from 'lucide-react'
import type { LensResult } from './LensCapture'

interface Props {
  result: LensResult
  onAddToInvoice: (item: { description: string; unit_price: number }) => void
}

function parseLowPrice(priceRange: string): number {
  const match = priceRange.replace(/[^0-9.,-]/g, '').split(/[-,]/)[0]
  const val = parseFloat(match)
  return isNaN(val) ? 0 : val
}

export default function LensResultCard({ result, onAddToInvoice }: Props) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    const unit_price = parseLowPrice(result.price_range)
    onAddToInvoice({ description: result.part_name, unit_price })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5 mt-3">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={16} className="text-yellow-400 shrink-0" />
        <h3 className="font-display text-xl tracking-widest text-white">
          {result.part_name}
        </h3>
      </div>

      <p className="text-white/50 text-sm mb-3">{result.use_case}</p>

      <span className="inline-block bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-xs px-3 py-1 rounded-full mb-4">
        {result.price_range}
      </span>

      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
          Supplier Alternatives
        </p>
        <div className="flex flex-col gap-2">
          {result.suppliers.map((s, i) => (
            <div
              key={i}
              className="bg-[#131C28] border border-white/6 rounded-lg px-3 py-2"
            >
              <p className="text-white text-sm font-mono">{s.name}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-1">
          Recommendation
        </p>
        <p className="text-white/70 text-sm">{result.recommendation}</p>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-display text-lg tracking-widest hover:bg-yellow-300 transition-colors"
      >
        {added ? (
          <>
            <CheckCircle size={16} />
            Added!
          </>
        ) : (
          'Add to Invoice'
        )}
      </button>
    </div>
  )
}
