import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="bg-bg flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <p
        className="mb-2 text-8xl font-bold text-[rgba(30,27,22,0.08)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </p>
      <h1 className="text-fg mb-3 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        Page introuvable
      </h1>
      <p className="text-fg-muted mb-8 max-w-sm">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link
        href={'/dashboard' as Route}
        className="bg-brand hover:bg-brand-dark inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>
    </div>
  )
}
