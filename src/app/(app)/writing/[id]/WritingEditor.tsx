'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WritingPrompt {
  id: string
  title: string
  instructions: string
  sentence_starters: string[]
  model_answer: string
  word_min: number
  word_max: number
  level_code: string
  theme: string
  topic: string
  sub_topic: string | null
  order_index: number
}

interface Props {
  prompt: WritingPrompt
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WritingEditor({ prompt }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [modelAnswerVisible, setModelAnswerVisible] = useState(false)
  const [xpEarned, setXpEarned] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const wordCount = countWords(content)
  const atMin = wordCount >= prompt.word_min

  // ── Insert sentence starter at cursor ────────────────────────────────────────
  function insertStarter(starter: string) {
    const ta = textareaRef.current
    if (!ta) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent = content.slice(0, start) + starter + ' ' + content.slice(end)
    setContent(newContent)

    requestAnimationFrame(() => {
      ta.focus()
      const newPos = start + starter.length + 1
      ta.setSelectionRange(newPos, newPos)
    })
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (saving || submitted || wordCount < prompt.word_min) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/writing/${prompt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, wordCount }),
      })

      const json = (await res.json()) as {
        data?: { xpAwarded: number }
        error?: string
        message?: string
      }

      if (!res.ok) {
        setError(json.message ?? json.error ?? 'Une erreur est survenue.')
        return
      }

      setXpEarned(json.data?.xpAwarded ?? 15)
      setSubmitted(true)
    } catch {
      setError('Impossible de soumettre. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(false)
    }
  }

  // ── Word count bar fill color ─────────────────────────────────────────────────
  const barFillColor = atMin
    ? '#2F7D52'
    : wordCount > 0
      ? 'var(--color-accent)'
      : 'var(--color-fg-subtle)'
  const barWidth = `${Math.min((wordCount / prompt.word_max) * 100, 100)}%`

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href={`/levels/${prompt.level_code.toLowerCase()}/writing` as Route}
          className="text-fg-muted hover:text-brand mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux exercices
        </Link>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            {prompt.sub_topic && (
              <span className="border-brand/20 text-brand mb-2 inline-flex items-center rounded-md border bg-[#F5E8E3] px-2.5 py-0.5 text-xs font-medium">
                {prompt.sub_topic}
              </span>
            )}
            <h1
              className="text-fg text-2xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {prompt.title}
            </h1>
            <p className="text-fg-subtle mt-1 text-xs">
              {prompt.topic} · {prompt.level_code}
            </p>
          </div>
        </div>
      </div>

      {/* ── Instructions ── */}
      <div className="bg-bg mb-5 rounded-xl border border-[rgba(30,27,22,0.08)] p-4">
        <p className="text-fg text-sm leading-relaxed">{prompt.instructions}</p>
      </div>

      {/* ── Sentence starters ── */}
      {prompt.sentence_starters.length > 0 && (
        <div className="mb-5">
          <p className="text-fg-muted mb-2 text-xs font-semibold tracking-wide uppercase">
            Points de départ :
          </p>
          <div className="flex flex-wrap gap-2">
            {prompt.sentence_starters.map((starter) => (
              <button
                key={starter}
                onClick={() => insertStarter(starter)}
                disabled={submitted}
                className="border-brand/30 text-brand hover:bg-brand rounded-lg border bg-[#F5E8E3] px-3 py-1 text-sm transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Textarea ── */}
      <div className="relative mb-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => !submitted && setContent(e.target.value)}
          rows={10}
          disabled={submitted}
          placeholder="Commencez à écrire ici…"
          className={`text-fg w-full resize-none rounded-xl border px-4 py-3 text-base leading-relaxed transition-colors outline-none ${
            submitted
              ? 'bg-bg cursor-default border-[rgba(30,27,22,0.1)] opacity-80'
              : 'border-brand/30 focus:border-brand focus:ring-brand/30 bg-white focus:ring-1'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        />
      </div>

      {/* ── Word count bar ── */}
      <div className="mb-5">
        <div className="text-fg-muted mb-1.5 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${atMin ? 'text-[#2F7D52]' : wordCount > 0 ? 'text-accent' : 'text-fg-subtle'}`}
          >
            {wordCount} mot{wordCount !== 1 ? 's' : ''}
          </span>
          <span>
            min {prompt.word_min} – max {prompt.word_max} mots
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: barWidth, backgroundColor: barFillColor }}
          />
        </div>
        {!atMin && wordCount > 0 && (
          <p className="text-accent mt-1 text-xs">
            Encore {prompt.word_min - wordCount} mot{prompt.word_min - wordCount !== 1 ? 's' : ''}{' '}
            minimum
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 rounded-xl border border-[#9B2335]/20 bg-[#F9EAEC] px-4 py-3 text-sm text-[#9B2335]">
          {error}
        </div>
      )}

      {/* ── Submit button ── */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!atMin || saving}
          className="bg-brand hover:bg-brand-dark w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Envoi en cours…' : 'Soumettre mon texte →'}
        </button>
      )}

      {/* ── Post-submit state ── */}
      {submitted && (
        <div className="flex flex-col gap-4">
          {/* Success banner */}
          <div className="flex items-center gap-3 rounded-xl border border-[#2F7D52]/20 bg-[#E8F5EE] px-4 py-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#2F7D52]" />
            <div>
              <p className="text-sm font-semibold text-[#2F7D52]">
                Bravo ! Texte soumis avec succès.
              </p>
              {xpEarned !== null && (
                <p className="mt-0.5 text-xs text-[#2F7D52]/80">+{xpEarned} XP gagnés</p>
              )}
            </div>
          </div>

          {/* Model answer toggle */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
            <button
              onClick={() => setModelAnswerVisible((v) => !v)}
              className="text-fg hover:bg-bg flex w-full items-center justify-between px-5 py-4 text-sm font-semibold transition-colors"
            >
              <span>Voir la réponse modèle</span>
              {modelAnswerVisible ? (
                <ChevronUp className="text-fg-muted h-4 w-4" />
              ) : (
                <ChevronDown className="text-fg-muted h-4 w-4" />
              )}
            </button>

            {modelAnswerVisible && (
              <div className="border-t border-[rgba(30,27,22,0.06)] px-5 pt-1 pb-5">
                <p
                  className="text-fg text-base leading-relaxed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {prompt.model_answer}
                </p>
              </div>
            )}
          </div>

          {/* Next action */}
          <div className="flex items-center gap-3">
            <Link
              href={`/levels/${prompt.level_code.toLowerCase()}/writing` as Route}
              className="bg-brand hover:bg-brand-dark flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-colors"
            >
              Écrire un autre texte →
            </Link>
            <Link
              href={'/writing/history' as Route}
              className="border-brand/30 text-brand flex-1 rounded-xl border py-2.5 text-center text-sm font-semibold transition-colors hover:bg-[#F5E8E3]"
            >
              Voir mon historique
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
