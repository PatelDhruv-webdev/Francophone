'use client'

import { create } from 'zustand'
import type { Exercise } from '@/types/exercises'

export type LessonPhase = 'intro' | 'exercise' | 'feedback' | 'complete'

interface LessonState {
  exercises: Exercise[]
  currentIndex: number
  phase: LessonPhase
  // Totals for the session summary
  correctCount: number
  totalXpEarned: number
  // Whether the last answer was correct (drives feedback UI)
  lastCorrect: boolean | null
  lastDisplayAnswer: string | null

  // Actions
  startLesson: (exercises: Exercise[]) => void
  showFeedback: (correct: boolean, displayAnswer: string, xp: number) => void
  nextExercise: () => void
  resetLesson: () => void
}

export const useLessonStore = create<LessonState>()((set, get) => ({
  exercises: [],
  currentIndex: 0,
  phase: 'intro',
  correctCount: 0,
  totalXpEarned: 0,
  lastCorrect: null,
  lastDisplayAnswer: null,

  startLesson: (exercises) =>
    set({
      exercises,
      currentIndex: 0,
      phase: 'exercise',
      correctCount: 0,
      totalXpEarned: 0,
      lastCorrect: null,
      lastDisplayAnswer: null,
    }),

  showFeedback: (correct, displayAnswer, xp) =>
    set((s) => ({
      phase: 'feedback',
      lastCorrect: correct,
      lastDisplayAnswer: displayAnswer,
      correctCount: s.correctCount + (correct ? 1 : 0),
      totalXpEarned: s.totalXpEarned + xp,
    })),

  nextExercise: () => {
    const { currentIndex, exercises } = get()
    const next = currentIndex + 1
    if (next >= exercises.length) {
      set({ phase: 'complete' })
    } else {
      set({ currentIndex: next, phase: 'exercise', lastCorrect: null, lastDisplayAnswer: null })
    }
  },

  resetLesson: () =>
    set({
      exercises: [],
      currentIndex: 0,
      phase: 'intro',
      correctCount: 0,
      totalXpEarned: 0,
      lastCorrect: null,
      lastDisplayAnswer: null,
    }),
}))
