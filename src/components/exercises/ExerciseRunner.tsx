'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { MultipleChoice } from './MultipleChoice'
import { TypeAnswer } from './TypeAnswer'
import { WordOrder } from './WordOrder'
import { FeedbackBar } from './FeedbackBar'
import { PictureChoice } from './PictureChoice'
import { FillInBlank } from './FillInBlank'
import { MatchPairs } from './MatchPairs'
import { ListeningBlank } from './ListeningBlank'
import { ReadingComprehension } from './ReadingComprehension'
import { Conjugation } from './Conjugation'
// SpeakingRepeat uses Web Speech API — must be loaded client-side only
const SpeakingRepeat = dynamic(
  () => import('./SpeakingRepeat').then((m) => ({ default: m.SpeakingRepeat })),
  { ssr: false },
)
import { useLessonStore } from '@/store/lessonStore'
import type { Exercise, UserAnswer } from '@/types/exercises'
import type {
  MultipleChoiceData,
  TypeAnswerData,
  ConjugationData,
  WordOrderData,
  PictureChoiceData,
  FillInBlankData,
  MatchPairsData,
  ListeningBlankData,
  SpeakingRepeatData,
  ReadingComprehensionData,
} from '@/types/exercises'

interface ExerciseRunnerProps {
  lessonId: string
  exercises: Exercise[]
  returnPath: string
}

export function ExerciseRunner({ lessonId, exercises, returnPath }: ExerciseRunnerProps) {
  const router = useRouter()
  const {
    currentIndex,
    phase,
    lastCorrect,
    lastDisplayAnswer,
    totalXpEarned,
    correctCount,
    startLesson,
    showFeedback,
    nextExercise,
  } = useLessonStore()

  useEffect(() => {
    startLesson(exercises)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

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
    showFeedback(data.correct, data.correctAnswer ?? '', data.xpAwarded)
  }

  function renderExercise() {
    if (!current) return null
    const isDisabled = phase === 'feedback'

    switch (current.type) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            prompt={current.prompt}
            data={current.data as MultipleChoiceData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'picture_choice':
        return (
          <PictureChoice
            prompt={current.prompt}
            data={current.data as PictureChoiceData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'type_answer':
        return (
          <TypeAnswer
            prompt={current.prompt}
            data={current.data as TypeAnswerData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'conjugation':
        return (
          <Conjugation
            data={current.data as ConjugationData}
            disabled={isDisabled}
            correctAnswer={isDisabled ? (lastDisplayAnswer ?? undefined) : undefined}
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
      case 'fill_in_blank': {
        const fibData = current.data as FillInBlankData
        // Derive blanks array: correct answers are stored server-side; we pass empty
        // strings here so the hook tracks user input. The correctness check happens
        // server-side via /api/exercises/[id]/submit.
        const blanksPlaceholders = fibData.blanks.map(() => '')
        return (
          <FillInBlank
            prompt={current.prompt}
            data={{ sentence: fibData.sentence, blanks: blanksPlaceholders }}
            disabled={isDisabled}
            onSubmit={handleSubmit}
            onResult={() => {}}
          />
        )
      }
      case 'match_pairs':
        return (
          <MatchPairs
            prompt={current.prompt}
            data={current.data as MatchPairsData}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      case 'listening_blank': {
        const lbData = current.data as ListeningBlankData
        const lbBlanks = lbData.blanks.map(() => '')
        return (
          <ListeningBlank
            prompt={current.prompt}
            data={{
              audio_url: lbData.audio_url,
              sentence: lbData.transcript_template,
              blanks: lbBlanks,
            }}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      }
      case 'speaking_repeat': {
        const srData = current.data as SpeakingRepeatData
        return (
          <SpeakingRepeat
            prompt={current.prompt}
            data={{ phrase: srData.target_text, translation: undefined }}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      }
      case 'reading_comprehension': {
        const rcData = current.data as ReadingComprehensionData
        // Render first question if available; multi-question passages could
        // be looped but the current exercise model shows one question at a time.
        const q = rcData.questions[0]
        if (!q) return null
        return (
          <ReadingComprehension
            prompt={current.prompt}
            data={{ passage: '', question: q.q, options: q.options }}
            disabled={isDisabled}
            onSubmit={handleSubmit}
          />
        )
      }
      default:
        return (
          <div className="text-muted-foreground text-sm">
            Exercise type &ldquo;{current.type}&rdquo; is not yet supported.
          </div>
        )
    }
  }

  if (phase === 'complete') {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5EE] text-3xl">
          🎉
        </div>
        <div>
          <h2
            className="text-foreground text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lesson complete!
          </h2>
          <p className="text-muted-foreground mt-1">
            {correctCount} / {exercises.length} correct · {totalXpEarned} XP earned
          </p>
        </div>
        <button
          onClick={() => router.push(returnPath as Parameters<typeof router.push>[0])}
          className="bg-brand hover:bg-brand-dark rounded-xl px-6 py-3 font-semibold text-white transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  const progressPct = exercises.length > 0 ? Math.round((currentIndex / exercises.length) * 100) : 0

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Progress bar header */}
      <div className="bg-background/95 border-border sticky top-0 z-30 border-b px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="text-muted-foreground w-10 text-xs tabular-nums">
            {currentIndex + 1}/{exercises.length}
          </span>
          <Progress value={progressPct} className="bg-muted h-2.5 flex-1" />
        </div>
      </div>

      {/* Exercise content */}
      <div className="flex flex-1 items-start justify-center px-4 pt-8 pb-32">
        <div className="w-full max-w-2xl">{renderExercise()}</div>
      </div>

      {/* Feedback overlay */}
      {phase === 'feedback' && lastCorrect !== null && (
        <FeedbackBar
          correct={lastCorrect}
          displayAnswer={lastDisplayAnswer ?? ''}
          xpAwarded={totalXpEarned}
          onContinue={nextExercise}
        />
      )}
    </div>
  )
}
