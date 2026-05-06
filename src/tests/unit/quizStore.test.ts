import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from '@/store/quizStore'
import type { Exercise } from '@/types/exercises'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeExercise(id: string): Exercise {
  return {
    id,
    lesson_id: 'lesson-1',
    type: 'multiple_choice',
    prompt: `Q${id}`,
    data: { question: 'Q', options: ['A', 'B', 'C', 'D'] },
    difficulty: 1,
    level_code: 'A1',
    tags: [],
    order_index: 0,
  }
}

const EX3 = [makeExercise('q1'), makeExercise('q2'), makeExercise('q3')]
const EX1 = [makeExercise('solo')]

function store() {
  return useQuizStore.getState()
}

beforeEach(() => {
  useQuizStore.getState().resetQuiz()
})

// ─── startQuiz ────────────────────────────────────────────────────────────────

describe('startQuiz', () => {
  it('sets phase to active', () => {
    store().startQuiz('c1', 'Chapter 1', EX3)
    expect(store().phase).toBe('active')
  })
  it('stores chapterId and chapterTitle', () => {
    store().startQuiz('ch-42', 'Les verbes', EX3)
    expect(store().chapterId).toBe('ch-42')
    expect(store().chapterTitle).toBe('Les verbes')
  })
  it('resets currentIndex to 0', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, true, 'A', 5)
    store().nextQuestion()
    expect(store().currentIndex).toBe(1)
    store().startQuiz('c1', 'T', EX3)
    expect(store().currentIndex).toBe(0)
  })
  it('resets attempts to empty array', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, true, 'A', 5)
    expect(store().attempts).toHaveLength(1)
    store().startQuiz('c1', 'T', EX3)
    expect(store().attempts).toHaveLength(0)
  })
  it('resets totalXpEarned to 0', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, true, 'A', 25)
    expect(store().totalXpEarned).toBe(25)
    store().startQuiz('c1', 'T', EX3)
    expect(store().totalXpEarned).toBe(0)
  })
  it('sets startedAt to a truthy timestamp', () => {
    store().startQuiz('c1', 'T', EX3)
    expect(store().startedAt).toBeGreaterThan(0)
  })
  it('clears finishedAt', () => {
    store().startQuiz('c1', 'T', EX1)
    store().showFeedback(1, true, 'A', 5)
    store().nextQuestion()
    expect(store().phase).toBe('review')
    expect(store().finishedAt).toBeGreaterThan(0)
    // Restart
    store().startQuiz('c1', 'T', EX3)
    expect(store().finishedAt).toBeNull()
  })
  it('works with empty exercises array', () => {
    store().startQuiz('c1', 'T', [])
    expect(store().phase).toBe('active')
    expect(store().exercises).toHaveLength(0)
  })
})

// ─── showFeedback ─────────────────────────────────────────────────────────────

describe('showFeedback', () => {
  it('sets phase to feedback', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, true, 'A', 5)
    expect(store().phase).toBe('feedback')
  })
  it('sets lastCorrect', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, false, 'correct', 1)
    expect(store().lastCorrect).toBe(false)
  })
  it('sets lastDisplayAnswer', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(1, false, 'est', 1)
    expect(store().lastDisplayAnswer).toBe('est')
  })
  it('appends attempt record', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(2, true, 'A', 5)
    const attempts = store().attempts
    expect(attempts).toHaveLength(1)
    expect(attempts[0]!.correct).toBe(true)
    expect(attempts[0]!.xpAwarded).toBe(5)
    expect(attempts[0]!.exercise.id).toBe('q1')
    expect(attempts[0]!.userAnswer).toBe(2)
  })
  it('accumulates totalXpEarned', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    store().showFeedback(1, false, 'B', 1)
    store().nextQuestion()
    store().showFeedback(2, true, 'C', 5)
    expect(store().totalXpEarned).toBe(11)
  })
  it('does not append when no current exercise (out-of-bounds guard)', () => {
    store().startQuiz('c1', 'T', [])
    store().showFeedback(0, true, 'A', 5)
    // current = exercises[0] which is undefined — should not append
    expect(store().attempts).toHaveLength(0)
  })
  it('stores wrong answers in attempts too', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(3, false, 'correct', 1)
    expect(store().attempts[0]!.correct).toBe(false)
    expect(store().attempts[0]!.correctAnswer).toBe('correct')
  })
})

// ─── nextQuestion ─────────────────────────────────────────────────────────────

describe('nextQuestion', () => {
  it('advances currentIndex by 1', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, true, '', 5)
    store().nextQuestion()
    expect(store().currentIndex).toBe(1)
  })
  it('sets phase back to active', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, true, '', 5)
    store().nextQuestion()
    expect(store().phase).toBe('active')
  })
  it('clears lastCorrect and lastDisplayAnswer', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, false, 'answer', 1)
    store().nextQuestion()
    expect(store().lastCorrect).toBeNull()
    expect(store().lastDisplayAnswer).toBeNull()
  })
  it('transitions to review after last question', () => {
    store().startQuiz('c1', 'T', EX1)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    expect(store().phase).toBe('review')
  })
  it('sets finishedAt when transitioning to review', () => {
    store().startQuiz('c1', 'T', EX1)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    expect(store().finishedAt).toBeGreaterThan(0)
  })
  it('finishedAt >= startedAt', () => {
    store().startQuiz('c1', 'T', EX1)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    expect(store().finishedAt!).toBeGreaterThanOrEqual(store().startedAt!)
  })
  it('transitions to review after all 3 questions', () => {
    store().startQuiz('c1', 'T', EX3)
    for (let i = 0; i < 3; i++) {
      store().showFeedback(i, i % 2 === 0, 'A', 5)
      store().nextQuestion()
    }
    expect(store().phase).toBe('review')
    expect(store().attempts).toHaveLength(3)
  })
})

// ─── Score calculation (derived from attempts) ────────────────────────────────

describe('score derivation from attempts', () => {
  it('100% score when all correct', () => {
    store().startQuiz('c1', 'T', EX3)
    for (let i = 0; i < 3; i++) {
      store().showFeedback(i, true, 'A', 5)
      store().nextQuestion()
    }
    const { attempts } = store()
    const correct = attempts.filter((a) => a.correct).length
    expect(correct / attempts.length).toBe(1)
  })
  it('0% score when all wrong', () => {
    store().startQuiz('c1', 'T', EX3)
    for (let i = 0; i < 3; i++) {
      store().showFeedback(i, false, 'A', 1)
      store().nextQuestion()
    }
    const { attempts } = store()
    const correct = attempts.filter((a) => a.correct).length
    expect(correct).toBe(0)
  })
  it('partial score: 1 out of 3', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    store().showFeedback(1, false, 'B', 1)
    store().nextQuestion()
    store().showFeedback(2, false, 'C', 1)
    store().nextQuestion()
    const { attempts } = store()
    const correct = attempts.filter((a) => a.correct).length
    expect(correct).toBe(1)
    expect(Math.round((correct / attempts.length) * 100)).toBe(33)
  })
  it('XP sum matches sum of individual awards', () => {
    store().startQuiz('c1', 'T', EX3)
    const xps = [5, 1, 5]
    for (let i = 0; i < 3; i++) {
      store().showFeedback(i, true, 'A', xps[i]!)
      store().nextQuestion()
    }
    expect(store().totalXpEarned).toBe(11)
  })
})

// ─── resetQuiz ────────────────────────────────────────────────────────────────

describe('resetQuiz', () => {
  it('restores all fields to initial values', () => {
    store().startQuiz('c1', 'T', EX3)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    store().resetQuiz()
    const s = store()
    expect(s.chapterId).toBeNull()
    expect(s.chapterTitle).toBe('')
    expect(s.exercises).toHaveLength(0)
    expect(s.currentIndex).toBe(0)
    expect(s.phase).toBe('idle')
    expect(s.attempts).toHaveLength(0)
    expect(s.totalXpEarned).toBe(0)
    expect(s.startedAt).toBeNull()
    expect(s.finishedAt).toBeNull()
    expect(s.lastCorrect).toBeNull()
    expect(s.lastDisplayAnswer).toBeNull()
  })
  it('can reset from review phase', () => {
    store().startQuiz('c1', 'T', EX1)
    store().showFeedback(0, true, 'A', 5)
    store().nextQuestion()
    expect(store().phase).toBe('review')
    store().resetQuiz()
    expect(store().phase).toBe('idle')
  })
})
