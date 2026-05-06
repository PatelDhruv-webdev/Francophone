'use client'

import { create } from 'zustand'
import type { Exercise } from '@/types/exercises'

export type QuizPhase = 'idle' | 'active' | 'feedback' | 'review'

interface QuizAttempt {
  exercise: Exercise
  userAnswer: unknown
  correct: boolean
  correctAnswer: string
  xpAwarded: number
}

interface QuizState {
  chapterId: string | null
  chapterTitle: string
  exercises: Exercise[]
  currentIndex: number
  phase: QuizPhase
  attempts: QuizAttempt[]
  totalXpEarned: number
  startedAt: number | null
  finishedAt: number | null

  // Last feedback state
  lastCorrect: boolean | null
  lastDisplayAnswer: string | null

  // Actions
  startQuiz: (chapterId: string, chapterTitle: string, exercises: Exercise[]) => void
  showFeedback: (answer: unknown, correct: boolean, correctAnswer: string, xp: number) => void
  nextQuestion: () => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  chapterId: null,
  chapterTitle: '',
  exercises: [],
  currentIndex: 0,
  phase: 'idle',
  attempts: [],
  totalXpEarned: 0,
  startedAt: null,
  finishedAt: null,
  lastCorrect: null,
  lastDisplayAnswer: null,

  startQuiz: (chapterId, chapterTitle, exercises) =>
    set({
      chapterId,
      chapterTitle,
      exercises,
      currentIndex: 0,
      phase: 'active',
      attempts: [],
      totalXpEarned: 0,
      startedAt: Date.now(),
      finishedAt: null,
      lastCorrect: null,
      lastDisplayAnswer: null,
    }),

  showFeedback: (answer, correct, correctAnswer, xp) => {
    const { currentIndex, exercises } = get()
    const current = exercises[currentIndex]
    if (!current) return
    set((s) => ({
      phase: 'feedback',
      lastCorrect: correct,
      lastDisplayAnswer: correctAnswer,
      totalXpEarned: s.totalXpEarned + xp,
      attempts: [
        ...s.attempts,
        { exercise: current, userAnswer: answer, correct, correctAnswer, xpAwarded: xp },
      ],
    }))
  },

  nextQuestion: () => {
    const { currentIndex, exercises } = get()
    const next = currentIndex + 1
    if (next >= exercises.length) {
      set({ phase: 'review', finishedAt: Date.now() })
    } else {
      set({ currentIndex: next, phase: 'active', lastCorrect: null, lastDisplayAnswer: null })
    }
  },

  resetQuiz: () =>
    set({
      chapterId: null,
      chapterTitle: '',
      exercises: [],
      currentIndex: 0,
      phase: 'idle',
      attempts: [],
      totalXpEarned: 0,
      startedAt: null,
      finishedAt: null,
      lastCorrect: null,
      lastDisplayAnswer: null,
    }),
}))
