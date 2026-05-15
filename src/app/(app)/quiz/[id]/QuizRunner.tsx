'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Trophy, CheckCircle2, XCircle, Star, RotateCcw, ArrowRight, Zap } from 'lucide-react'
import { useQuizStore } from '@/store/quizStore'
import { MultipleChoice } from '@/components/exercises/MultipleChoice'
import { TypeAnswer } from '@/components/exercises/TypeAnswer'
import { WordOrder } from '@/components/exercises/WordOrder'
import { FeedbackBar } from '@/components/exercises/FeedbackBar'
import type {
  Exercise,
  UserAnswer,
  MultipleChoiceData,
  TypeAnswerData,
  ConjugationData,
  WordOrderData,
  PictureChoiceData,
} from '@/types/exercises'

interface Props {
  chapterId: string
  chapterTitle: string
  levelCode: string
  exercises: Exercise[]
  returnPath: string
}

export function QuizRunner({
  chapterId,
  chapterTitle,
  levelCode: _levelCode,
  exercises,
  returnPath,
}: Props) {
  const {
    phase,
    currentIndex,
    lastCorrect,
    lastDisplayAnswer,
    totalXpEarned,
    attempts,
    startQuiz,
    showFeedback,
    nextQuestion,
    resetQuiz,
  } = useQuizStore()

  useEffect(() => {
    if (exercises.length > 0) {
      startQuiz(chapterId, chapterTitle, exercises)
    }
    return () => {
      resetQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  const current = exercises[currentIndex]

  async function handleSubmit(answer: UserAnswer) {
    if (!current) return

    const res = await fetch(`/api/exercises/${current.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: current.id, answer }),
    })

    const data = (await res.json()) as {
      correct: boolean
      xpAwarded: number
      correctAnswer?: string
    }

    showFeedback(answer, data.correct, data.correctAnswer ?? '', data.xpAwarded)
  }

  function renderExercise() {
    if (!current) return null
    const isDisabled = phase === 'feedback'

    switch (current.type) {
      case 'multiple_choice':
      case 'picture_choice':
        return (
          <MultipleChoice
            prompt={current.prompt}
            data={current.data as MultipleChoiceData | PictureChoiceData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'type_answer':
      case 'conjugation':
        return (
          <TypeAnswer
            prompt={current.prompt}
            data={current.data as TypeAnswerData | ConjugationData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'word_order':
        return (
          <WordOrder
            prompt={current.prompt}
            data={current.data as WordOrderData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      default:
        return (
          <TypeAnswer
            prompt={current.prompt}
            data={current.data as TypeAnswerData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-fg-muted mb-4">No exercises found for this quiz.</p>
        <Link
          href={returnPath as Route}
          className="bg-brand hover:bg-brand-dark rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          Back
        </Link>
      </div>
    )
  }

  // ── Review / Summary screen ────────────────────────────────────────────────
  if (phase === 'review') {
    const correctCount = attempts.filter((a) => a.correct).length
    const score = Math.round((correctCount / attempts.length) * 100)
    const elapsedMs = useQuizStore.getState().finishedAt! - useQuizStore.getState().startedAt!
    const elapsedSec = Math.round(elapsedMs / 1000)
    const mins = Math.floor(elapsedSec / 60)
    const secs = elapsedSec % 60

    return (
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        {/* Score banner */}
        <div className="mb-6 rounded-2xl border border-[rgba(30,27,22,0.08)] bg-white p-8 text-center shadow-[0_4px_16px_rgba(30,27,22,0.1)]">
          <Trophy className="text-accent mx-auto mb-3 h-12 w-12" />
          <h1
            className="text-fg mb-1 text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quiz Complete!
          </h1>
          <p className="text-fg-muted mb-6">{chapterTitle}</p>

          <div className="mb-6 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-brand text-3xl font-bold">{score}%</p>
              <p className="text-fg-subtle mt-0.5 text-xs">Score</p>
            </div>
            <div className="w-px bg-[rgba(30,27,22,0.1)]" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#2F7D52]">
                {correctCount}/{attempts.length}
              </p>
              <p className="text-fg-subtle mt-0.5 text-xs">Correct</p>
            </div>
            <div className="w-px bg-[rgba(30,27,22,0.1)]" />
            <div className="text-center">
              <p className="text-accent text-3xl font-bold">+{totalXpEarned}</p>
              <p className="text-fg-subtle mt-0.5 text-xs">XP</p>
            </div>
          </div>

          <p className="text-fg-subtle text-xs">
            Time: {mins > 0 ? `${mins}m ` : ''}
            {secs}s
          </p>
        </div>

        {/* Attempt review */}
        <div className="mb-6">
          <h2 className="text-fg mb-3 text-sm font-semibold tracking-wide uppercase">Review</h2>
          <div className="space-y-2">
            {attempts.map((attempt, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                  attempt.correct
                    ? 'border-[rgba(47,125,82,0.2)] bg-[#E8F5EE]'
                    : 'border-[rgba(155,35,53,0.2)] bg-[#F9EAEC]'
                }`}
              >
                {attempt.correct ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2F7D52]" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9B2335]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-fg-muted truncate text-xs">{attempt.exercise.prompt}</p>
                  {!attempt.correct && (
                    <p className="mt-0.5 text-xs text-[#9B2335]">
                      Answer: <span className="font-medium">{attempt.correctAnswer}</span>
                    </p>
                  )}
                </div>
                <div className="text-accent flex flex-shrink-0 items-center gap-1 text-xs">
                  <Zap className="h-3 w-3" />+{attempt.xpAwarded}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => startQuiz(chapterId, chapterTitle, exercises)}
            className="text-fg hover:bg-bg flex flex-1 items-center justify-center gap-2 rounded-xl border border-[rgba(30,27,22,0.15)] px-4 py-3 text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Quiz
          </button>
          <Link
            href={returnPath as Route}
            className="bg-brand hover:bg-brand-dark flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors"
          >
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // ── Active quiz ────────────────────────────────────────────────────────────
  const progress = (currentIndex / exercises.length) * 100

  return (
    <div>
      {/* Progress bar header */}
      <div className="sticky top-0 z-10 border-b border-[rgba(30,27,22,0.08)] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href={returnPath as Route}
            className="text-fg-subtle hover:text-brand text-xs transition-colors"
          >
            ✕
          </Link>
          <div className="h-2 flex-1 rounded-full bg-[#F5E6B8]">
            <div
              className="bg-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-fg-subtle text-xs whitespace-nowrap">
            {currentIndex + 1}/{exercises.length}
          </span>
        </div>
      </div>

      {/* Quiz badge */}
      <div className="mx-auto max-w-2xl px-4 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <Star className="text-accent h-4 w-4" />
          <span className="text-fg-muted text-xs font-medium">Chapter Quiz · {chapterTitle}</span>
        </div>
      </div>

      {/* Exercise */}
      <div className="mx-auto max-w-2xl px-4 py-4 pb-32">{renderExercise()}</div>

      {/* Feedback bar */}
      {phase === 'feedback' && (
        <FeedbackBar
          correct={lastCorrect!}
          displayAnswer={lastDisplayAnswer ?? ''}
          xpAwarded={0}
          onContinue={nextQuestion}
        />
      )}
    </div>
  )
}
