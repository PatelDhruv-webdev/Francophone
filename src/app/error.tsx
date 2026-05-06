'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4EF] px-6 text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <h1
        className="mb-3 text-3xl font-bold text-[#1E1B16]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Une erreur est survenue
      </h1>
      <p className="mb-6 max-w-sm text-[#6B6460]">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou retourner au tableau de bord.
      </p>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mb-6 w-full max-w-lg overflow-x-auto rounded-xl bg-[#1E1B16] px-4 py-3 text-left text-xs break-words whitespace-pre-wrap text-[#F0EBE3]">
          {error.message}
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-xl bg-[#C24E2A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A03D20]"
        >
          Réessayer
        </button>
        <Link
          href={'/dashboard' as Route}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(30,27,22,0.15)] px-5 py-2.5 text-sm font-semibold text-[#1E1B16] transition-colors hover:bg-[rgba(30,27,22,0.04)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Tableau de bord
        </Link>
      </div>
    </div>
  )
}
