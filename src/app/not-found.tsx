import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4EF] px-6 text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <p
        className="mb-2 text-8xl font-bold text-[rgba(30,27,22,0.08)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </p>
      <h1
        className="mb-3 text-3xl font-bold text-[#1E1B16]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Page introuvable
      </h1>
      <p className="mb-8 max-w-sm text-[#6B6460]">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href={'/dashboard' as Route}
        className="inline-flex items-center gap-2 rounded-xl bg-[#C24E2A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A03D20]"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>
    </div>
  )
}
