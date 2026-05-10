'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="bg-bg flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <h1 className="text-fg mb-3 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        Une erreur est survenue
      </h1>
      <p className="text-fg-muted mb-6 max-w-sm">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou retourner au tableau de bord.
      </p>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="bg-fg mb-6 w-full max-w-lg overflow-x-auto rounded-xl px-4 py-3 text-left text-xs break-words whitespace-pre-wrap text-[#F0EBE3]">
          {error.message}
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bg-brand hover:bg-brand-dark rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Réessayer
        </button>
        <Link
          href={'/dashboard' as Route}
          className="text-fg inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(30,27,22,0.15)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[rgba(30,27,22,0.04)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Tableau de bord
        </Link>
      </div>
    </div>
  )
}
