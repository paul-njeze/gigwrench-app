'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, Loader2 } from 'lucide-react'

export interface LensResult {
  part_name: string
  use_case: string
  price_range: string
  suppliers: Array<{ name: string; reason: string }>
  recommendation: string
}

interface Props {
  onResult: (result: LensResult) => void
}

export default function LensCapture({ onResult }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    setError(null)
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string
        const base64 = dataUrl.split(',')[1]
        const res = await fetch('/api/lens/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        if (!res.ok) {
          const err = await res.json() as { error?: string }
          throw new Error(err.error ?? 'Request failed')
        }
        const result = await res.json() as LensResult
        onResult(result)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="bg-[#0B0F17] border border-white/6 rounded-xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
        Lens - Identify a Part
      </p>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {loading ? (
        <div className="flex items-center gap-3 text-white/50 font-mono text-sm py-4">
          <Loader2 size={18} className="animate-spin text-yellow-400" />
          <span>Lens is analysing...</span>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-2 bg-[#131C28] border border-white/8 text-white/60 hover:text-white hover:border-yellow-400/40 transition-all px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest"
          >
            <Camera size={14} />
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="flex items-center gap-2 bg-[#131C28] border border-white/8 text-white/60 hover:text-white hover:border-yellow-400/40 transition-all px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest"
          >
            <Upload size={14} />
            Upload Photo
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-red-400 font-mono text-xs">{error}</p>
      )}
    </div>
  )
}
