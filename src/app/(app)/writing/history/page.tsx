import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Route } from 'next'
import { PenLine, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

// Supabase returns a joined relation as an array even for many-to-one relationships
interface RawSubmission {
  id: string
  content: string
  word_count: number
  xp_awarded: number
  created_at: string
  writing_prompts: { title: string; topic: string; level_code: string }[] | null
}

interface Submission extends Omit<RawSubmission, 'writing_prompts'> {
  prompt: { title: string; topic: string; level_code: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(iso))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WritingHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/writing/history' as Route)
  }

  const { data: raw } = await supabase
    .from('writing_submissions')
    .select(
      'id, content, word_count, xp_awarded, created_at, writing_prompts(title, topic, level_code)',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Normalise: Supabase embeds the related row as an array — pick the first element
  const list: Submission[] = ((raw ?? []) as RawSubmission[]).map((s) => ({
    ...s,
    prompt: Array.isArray(s.writing_prompts) ? (s.writing_prompts[0] ?? null) : s.writing_prompts,
  }))

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={'/dashboard' as Route}
          className="text-fg-muted hover:text-brand mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tableau de bord
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5E8E3]">
            <PenLine className="text-brand h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-fg text-2xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mes textes
            </h1>
            <p className="text-fg-muted text-sm">
              {list.length} soumission{list.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {list.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
          <PenLine className="text-fg-subtle mx-auto mb-3 h-10 w-10" />
          <p className="text-fg-muted mb-4 text-sm">Vous n&apos;avez pas encore soumis de texte.</p>
          <Link
            href={'/levels/a1/writing' as Route}
            className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Commencez à écrire →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((sub) => {
            const prompt = sub.prompt
            const preview = sub.content.slice(0, 120) + (sub.content.length > 120 ? '…' : '')

            return (
              <div
                key={sub.id}
                className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {prompt && (
                      <>
                        <span className="border-brand/20 text-brand mb-1 inline-flex items-center rounded-md border bg-[#F5E8E3] px-2 py-0.5 text-xs font-medium">
                          {prompt.level_code} · {prompt.topic}
                        </span>
                        <h2
                          className="text-fg text-sm font-semibold"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {prompt.title}
                        </h2>
                      </>
                    )}
                    <p className="text-fg-subtle mt-0.5 text-xs">{formatDate(sub.created_at)}</p>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-[#F5E6B8] px-2 py-0.5 text-xs font-semibold text-[#B7820A]">
                      +{sub.xp_awarded} XP
                    </span>
                    <span className="text-fg-subtle text-xs">{sub.word_count} mots</span>
                  </div>
                </div>

                {/* Content preview */}
                <p
                  className="text-fg-muted text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {preview}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
