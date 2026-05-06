'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { ListeningVideo } from './page'

export type ListeningExercise = {
  type: 'fill_in_blank' | 'multiple_choice'
  question: string
  answer: string
  options: string[]
}

interface Props {
  video: ListeningVideo
  alreadyCompleted: boolean
}

// Normalize answer for lenient matching: lowercase, trim, strip diacritics
function normalizeAnswer(s: string): string {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function ListeningPlayer({ video, alreadyCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const exercises: ListeningExercise[] = video.exercises ?? []

  function handleChange(index: number, value: string) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)

    const total = exercises.length
    let correct = 0

    exercises.forEach((ex, i) => {
      const userAnswer = answers[i] ?? ''
      if (normalizeAnswer(userAnswer) === normalizeAnswer(ex.answer)) {
        correct++
      }
    })

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0

    setCorrectCount(correct)
    setScore(pct)
    setSubmitted(true)

    try {
      await fetch(`/api/listening/${video.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: pct }),
      })
    } catch {
      // Non-fatal — progress save failure shouldn't block the user
    } finally {
      setSubmitting(false)
    }
  }

  const isCorrect = (index: number): boolean => {
    const userAnswer = answers[index] ?? ''
    return normalizeAnswer(userAnswer) === normalizeAnswer(exercises[index]?.answer ?? '')
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ── Left column: video ── */}
      <div className="flex-shrink-0 lg:w-[56%]">
        {/* Already-completed banner */}
        {alreadyCompleted && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#2F7D52]/20 bg-[#E8F5EE] px-4 py-3 text-sm text-[#2F7D52]">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Vous avez déjà complété cette vidéo.</span>
          </div>
        )}

        {/* YouTube embed */}
        <div className="overflow-hidden rounded-xl shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
            width="100%"
            className="aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        <p className="mt-3 text-xs text-[#A09890] italic">
          Regardez la vidéo, puis répondez aux questions ci-dessous.
        </p>

        {video.description && (
          <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-relaxed text-[#6B6460] shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
            {video.description}
          </div>
        )}
      </div>

      {/* ── Right column: exercises ── */}
      <div className="min-w-0 flex-1">
        {exercises.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-[#A09890] shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
            Aucun exercice disponible pour cette vidéo.
          </div>
        ) : (
          <div className="flex flex-col gap-6 rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
            <h2
              className="text-base font-bold text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Exercices de compréhension
            </h2>

            {/* Exercise list */}
            <ol className="flex flex-col gap-6">
              {exercises.map((ex, i) => {
                const answered = submitted
                const correct = answered && isCorrect(i)
                const wrong = answered && !isCorrect(i)

                return (
                  <li key={i} className="flex flex-col gap-2">
                    {/* Question */}
                    <p className="text-sm font-medium text-[#1E1B16]">
                      <span className="mr-1 font-bold text-[#C24E2A]">{i + 1}.</span>
                      {ex.type === 'fill_in_blank'
                        ? ex.question.replace('___', '______')
                        : ex.question}
                    </p>

                    {/* Input */}
                    {ex.type === 'fill_in_blank' ? (
                      <input
                        type="text"
                        value={answers[i] ?? ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        disabled={submitted}
                        placeholder="Votre réponse…"
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#1E1B16] transition-colors outline-none disabled:opacity-80 ${
                          correct
                            ? 'border-[#2F7D52] bg-[#E8F5EE] focus:ring-2 focus:ring-[#2F7D52]/20'
                            : wrong
                              ? 'border-[#9B2335] bg-[#F9EAEC] focus:ring-2 focus:ring-[#9B2335]/20'
                              : 'border-[rgba(30,27,22,0.2)] bg-white focus:border-[#C24E2A] focus:ring-2 focus:ring-[#C24E2A]/30'
                        }`}
                      />
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {ex.options.map((opt, oi) => {
                          const selected = answers[i] === opt
                          const isThisCorrect =
                            submitted && normalizeAnswer(opt) === normalizeAnswer(ex.answer)
                          const isThisWrong = submitted && selected && !isThisCorrect

                          return (
                            <label
                              key={oi}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                isThisCorrect
                                  ? 'border-[#2F7D52] bg-[#E8F5EE] text-[#2F7D52]'
                                  : isThisWrong
                                    ? 'border-[#9B2335] bg-[#F9EAEC] text-[#9B2335]'
                                    : selected
                                      ? 'border-[#C24E2A] bg-[#FAF0EC] text-[#1E1B16]'
                                      : 'border-[rgba(30,27,22,0.15)] bg-white text-[#1E1B16] hover:border-[#C24E2A]'
                              } ${submitted ? 'cursor-default' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`exercise-${i}`}
                                value={opt}
                                checked={selected}
                                onChange={() => handleChange(i, opt)}
                                disabled={submitted}
                                className="accent-[#C24E2A]"
                              />
                              {opt}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {/* Per-exercise feedback */}
                    {submitted && (
                      <div
                        className={`flex items-start gap-1.5 text-xs font-medium ${
                          correct ? 'text-[#2F7D52]' : 'text-[#9B2335]'
                        }`}
                      >
                        {correct ? (
                          <>
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>Correct !</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              Incorrect — réponse correcte :{' '}
                              <span className="font-bold">{ex.answer}</span>
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>

            {/* Submit button */}
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="w-full rounded-lg bg-[#C24E2A] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A03D20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Envoi…' : 'Vérifier mes réponses'}
              </button>
            )}

            {/* Score summary */}
            {submitted && score !== null && (
              <div
                className={`flex flex-col gap-1.5 rounded-xl border px-4 py-4 ${
                  score >= 50
                    ? 'border-[#2F7D52]/20 bg-[#E8F5EE] text-[#2F7D52]'
                    : 'border-[#9B2335]/20 bg-[#F9EAEC] text-[#9B2335]'
                }`}
              >
                <p className="text-sm font-bold">
                  {correctCount}/{exercises.length} correctes — Score : {score}%
                </p>
                {score >= 50 ? (
                  <p className="flex items-center gap-1 text-xs">
                    <span>⚡</span>
                    <span>XP gagné : 10 XP</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Essayez encore !</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
