'use client'

import { useState } from 'react'
import { Volume2, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  src: string
  label?: string
}

export function AudioPlayer({ src, label = 'Écouter' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePlay() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      // Dynamically import Howler to keep it browser-only
      const { Howl } = await import('howler')
      const sound = new Howl({
        src: [src],
        html5: true,
        onload: () => {
          setLoading(false)
          sound.play()
        },
        onloaderror: (_id: number, err: unknown) => {
          setLoading(false)
          setError(typeof err === 'string' ? err : 'Impossible de charger le fichier audio.')
        },
        onplayerror: () => {
          setLoading(false)
          setError('Impossible de lire le fichier audio.')
        },
      })
    } catch {
      setLoading(false)
      setError('Erreur inattendue lors du chargement audio.')
    }
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#9B2335]/20 bg-[#F9EAEC] px-3 py-1 text-sm text-[#9B2335]">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-xs">{error}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#C24E2A]/20 bg-[#F5E8E3] px-3 py-1 text-sm font-medium text-[#C24E2A] transition-colors hover:bg-[#EDCFC4] disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>{loading ? 'Chargement…' : label}</span>
    </button>
  )
}
