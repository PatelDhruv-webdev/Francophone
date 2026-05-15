import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Sparkles } from 'lucide-react'
import { getVerbById } from '@/lib/services/verbs.service'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const verb = await getVerbById(id).catch(() => null)
  if (!verb) return { title: 'Verbe — FrancoPath' }
  return {
    title: `${verb.infinitif} — Conjugaison`,
    description: verb.edge_cases?.slice(0, 160) ?? `Conjugaison du verbe ${verb.infinitif}`,
  }
}

const TENSE_LABELS: Record<string, string> = {
  present: 'Présent',
  passe_compose: 'Passé composé',
  imparfait: 'Imparfait',
  futur_simple: 'Futur simple',
  futur_proche: 'Futur proche',
  conditionnel_present: 'Conditionnel présent',
  subjonctif_present: 'Subjonctif présent',
  imperatif: 'Impératif',
}

const PERSON_ORDER = ['je', 'tu', 'il', 'nous', 'vous', 'ils']
const PERSON_LABELS: Record<string, string> = {
  je: 'je / j’',
  tu: 'tu',
  il: 'il / elle / on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils / elles',
}

export default async function VerbDetailPage({ params }: Props) {
  const { id } = await params
  const verb = await getVerbById(id)
  if (!verb) notFound()

  const orderedTenses = Object.keys(TENSE_LABELS).filter((t) => verb.conjugations[t])
  const otherTenses = Object.keys(verb.conjugations).filter((t) => !TENSE_LABELS[t])

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <Link
        href={'/verbs' as Route}
        className="text-fg-muted hover:text-fg mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les verbes
      </Link>

      <header className="mb-6 rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-6 shadow-[0_2px_8px_rgba(30,27,22,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-fg text-3xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {verb.infinitif}
            </h1>
            {verb.en && <p className="text-fg-muted mt-1">{verb.en}</p>}
          </div>
          {verb.is_irregular && (
            <span className="bg-warning-soft text-warning-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              irrégulier
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {verb.level_code && <Tag label={`Niveau ${verb.level_code}`} tone="primary" />}
          {verb.verb_group && <Tag label={`Groupe ${verb.verb_group}`} tone="muted" />}
          {verb.auxiliary && <Tag label={`auxiliaire ${verb.auxiliary}`} tone="muted" />}
          {verb.participe_passe && (
            <Tag label={`p. passé : ${verb.participe_passe}`} tone="muted" />
          )}
          {verb.participe_present && (
            <Tag label={`p. présent : ${verb.participe_present}`} tone="muted" />
          )}
        </div>
      </header>

      {verb.edge_cases && (
        <section className="mb-6 rounded-xl border border-[#F5E8E3] bg-[#FCF7F4] p-5">
          <h2 className="text-brand mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Pièges à connaître
          </h2>
          <p className="text-sm leading-relaxed text-[#5A4C42]">{verb.edge_cases}</p>
        </section>
      )}

      <section className="space-y-5">
        {orderedTenses.map((t) => (
          <ConjugationBlock key={t} label={TENSE_LABELS[t]!} forms={verb.conjugations[t]!} />
        ))}
        {otherTenses.map((t) => (
          <ConjugationBlock key={t} label={prettifyTense(t)} forms={verb.conjugations[t]!} />
        ))}
      </section>
    </div>
  )
}

function ConjugationBlock({ label, forms }: { label: string; forms: Record<string, string> }) {
  const entries = PERSON_ORDER.filter((p) => forms[p]).map((p) => [p, forms[p]!] as const)
  if (entries.length === 0) {
    // Single-form tense (participle, infinitif). Render raw value.
    const single = forms.form ?? Object.values(forms)[0]
    return (
      <div className="rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-4">
        <h3 className="text-fg-subtle mb-1 text-xs font-semibold tracking-wide uppercase">
          {label}
        </h3>
        <p className="text-fg font-mono text-base">{single}</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-4">
      <h3 className="text-fg-subtle mb-3 text-xs font-semibold tracking-wide uppercase">{label}</h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3">
        {entries.map(([person, form]) => (
          <div key={person} className="flex items-baseline gap-2">
            <dt className="text-fg-subtle w-24 flex-shrink-0 text-xs">
              {PERSON_LABELS[person] ?? person}
            </dt>
            <dd className="text-fg font-mono text-sm">{form}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Tag({ label, tone }: { label: string; tone: 'primary' | 'muted' }) {
  const cls =
    tone === 'primary' ? 'bg-[#F5E8E3] text-brand' : 'bg-[rgba(30,27,22,0.06)] text-fg-muted'
  return <span className={`rounded-full px-2.5 py-1 font-medium ${cls}`}>{label}</span>
}

function prettifyTense(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Cache the rendered page per id at the edge — verbs data rarely changes.
export const revalidate = 3600
