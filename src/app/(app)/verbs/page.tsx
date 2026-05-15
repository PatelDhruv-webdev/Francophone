import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { ChevronRight, Sparkles } from 'lucide-react'
import { listVerbs, type VerbSummary } from '@/lib/services/verbs.service'

export const metadata: Metadata = {
  title: 'Verbes — FrancoPath',
  description:
    'Conjugaison française : 35 verbes essentiels avec toutes les difficultés expliquées.',
}

const GROUP_LABELS: Record<number, string> = {
  1: 'Groupe 1 — verbes en -er',
  2: 'Groupe 2 — verbes en -ir (réguliers)',
  3: 'Groupe 3 — verbes irréguliers',
}

export default async function VerbsPage() {
  const verbs = await listVerbs()
  const grouped = groupBy(verbs, (v) => v.verb_group ?? 0)
  const groups = [1, 2, 3].filter((g) => grouped.has(g))

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-fg text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Verbes
        </h1>
        <p className="text-fg-muted mt-1">
          {verbs.length} verbes essentiels — conjugaison complète et pièges expliqués.
        </p>
      </header>

      {verbs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="text-fg-subtle mb-3 text-sm font-semibold tracking-wide uppercase">
                {GROUP_LABELS[g] ?? `Groupe ${g}`}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.get(g)!.map((v) => (
                  <li key={v.id}>
                    <VerbCard verb={v} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function VerbCard({ verb }: { verb: VerbSummary }) {
  return (
    <Link
      href={`/verbs/${verb.id}` as Route}
      className="group flex items-center justify-between rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-4 shadow-[0_1px_3px_rgba(30,27,22,0.04)] transition-all duration-150 hover:border-[rgba(194,78,42,0.4)] hover:shadow-[0_2px_8px_rgba(194,78,42,0.08)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-fg text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {verb.infinitif}
          </span>
          {verb.is_irregular && (
            <Sparkles className="text-accent h-3.5 w-3.5" aria-label="irrégulier" />
          )}
        </div>
        {verb.en && <p className="text-fg-muted truncate text-sm">{verb.en}</p>}
        <div className="mt-2 flex items-center gap-2 text-xs">
          {verb.level_code && (
            <span className="text-brand rounded-full bg-[#F5E8E3] px-2 py-0.5 font-medium">
              {verb.level_code}
            </span>
          )}
          {verb.auxiliary && (
            <span className="text-fg-muted rounded-full bg-[rgba(30,27,22,0.06)] px-2 py-0.5">
              aux. {verb.auxiliary}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="text-fg-subtle group-hover:text-brand h-4 w-4 flex-shrink-0 transition-colors" />
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[rgba(30,27,22,0.15)] bg-white p-8 text-center">
      <h2
        className="text-fg mb-2 text-lg font-semibold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Pas encore de verbes
      </h2>
      <p className="text-fg-muted text-sm">
        Lance{' '}
        <code className="rounded bg-[rgba(30,27,22,0.06)] px-1.5 py-0.5 font-mono text-xs">
          npm run import:verbs
        </code>{' '}
        après avoir appliqué la migration{' '}
        <code className="rounded bg-[rgba(30,27,22,0.06)] px-1.5 py-0.5 font-mono text-xs">
          20240101000005_create_verbs.sql
        </code>
        .
      </p>
    </div>
  )
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const existing = result.get(k)
    if (existing) existing.push(item)
    else result.set(k, [item])
  }
  return result
}
