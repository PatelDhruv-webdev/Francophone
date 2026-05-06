import { describe, it, expect, beforeEach } from 'vitest'
import { useLessonStore } from '@/store/lessonStore'
import type { Exercise } from '@/types/exercises'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeExercise(id: string, type: Exercise['type'] = 'multiple_choice'): Exercise {
  return {
    id,
    lesson_id: 'lesson-1',
    type,
    prompt: `Prompt for ${id}`,
    data: { question: 'Q', options: ['A', 'B', 'C', 'D'] },
    difficulty: 1,
    level_code: 'A1',
    tags: ['test'],
    order_index: 0,
  }
}

const EXERCISES_3 = [makeExercise('e1'), makeExercise('e2'), makeExercise('e3')]
const EXERCISES_1 = [makeExercise('solo')]

function getStore() {
  return useLessonStore.getState()
}

// Reset store state before each test to avoid cross-test bleed
beforeEach(() => {
  useLessonStore.getState().resetLesson()
})

// ─── startLesson ──────────────────────────────────────────────────────────────

describe('startLesson', () => {
  it('sets phase to exercise', () => {
    getStore().startLesson(EXERCISES_3)
    expect(getStore().phase).toBe('exercise')
  })
  it('resets currentIndex to 0', () => {
    // Advance then restart
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    expect(getStore().currentIndex).toBe(1)
    getStore().startLesson(EXERCISES_3)
    expect(getStore().currentIndex).toBe(0)
  })
  it('resets correctCount to 0', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    expect(getStore().correctCount).toBe(1)
    getStore().startLesson(EXERCISES_3)
    expect(getStore().correctCount).toBe(0)
  })
  it('resets totalXpEarned to 0', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 15)
    expect(getStore().totalXpEarned).toBe(15)
    getStore().startLesson(EXERCISES_3)
    expect(getStore().totalXpEarned).toBe(0)
  })
  it('sets exercises to the provided array', () => {
    getStore().startLesson(EXERCISES_3)
    expect(getStore().exercises).toHaveLength(3)
    expect(getStore().exercises[0]!.id).toBe('e1')
  })
  it('works with an empty exercises array', () => {
    getStore().startLesson([])
    expect(getStore().phase).toBe('exercise')
    expect(getStore().exercises).toHaveLength(0)
  })
  it('restarts mid-session (replaces in-flight state)', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'x', 1)
    // Now restart with a different set
    getStore().startLesson(EXERCISES_1)
    const s = getStore()
    expect(s.exercises).toHaveLength(1)
    expect(s.correctCount).toBe(0)
    expect(s.phase).toBe('exercise')
    expect(s.lastCorrect).toBeNull()
  })
})

// ─── showFeedback ─────────────────────────────────────────────────────────────

describe('showFeedback', () => {
  it('sets phase to feedback', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, 'correct answer', 5)
    expect(getStore().phase).toBe('feedback')
  })
  it('sets lastCorrect true when correct', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    expect(getStore().lastCorrect).toBe(true)
  })
  it('sets lastCorrect false when wrong', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'the answer', 1)
    expect(getStore().lastCorrect).toBe(false)
  })
  it('sets lastDisplayAnswer', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'bonjour', 1)
    expect(getStore().lastDisplayAnswer).toBe('bonjour')
  })
  it('increments correctCount when correct', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    expect(getStore().correctCount).toBe(1)
    getStore().nextExercise()
    getStore().showFeedback(true, '', 5)
    expect(getStore().correctCount).toBe(2)
  })
  it('does NOT increment correctCount when wrong', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'x', 1)
    expect(getStore().correctCount).toBe(0)
  })
  it('accumulates totalXpEarned across multiple exercises', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    expect(getStore().totalXpEarned).toBe(5)
    getStore().nextExercise()
    getStore().showFeedback(false, 'x', 1)
    expect(getStore().totalXpEarned).toBe(6)
    getStore().nextExercise()
    getStore().showFeedback(true, '', 5)
    expect(getStore().totalXpEarned).toBe(11)
  })
  it('zero XP is allowed (wrong answer 0 XP path)', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'x', 0)
    expect(getStore().totalXpEarned).toBe(0)
  })
})

// ─── nextExercise ─────────────────────────────────────────────────────────────

describe('nextExercise', () => {
  it('advances currentIndex by 1', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    expect(getStore().currentIndex).toBe(1)
  })
  it('sets phase back to exercise', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    expect(getStore().phase).toBe('exercise')
  })
  it('clears lastCorrect and lastDisplayAnswer', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(false, 'answer', 1)
    getStore().nextExercise()
    expect(getStore().lastCorrect).toBeNull()
    expect(getStore().lastDisplayAnswer).toBeNull()
  })
  it('transitions to complete after last exercise', () => {
    getStore().startLesson(EXERCISES_1)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    expect(getStore().phase).toBe('complete')
  })
  it('transitions to complete after all 3 exercises', () => {
    getStore().startLesson(EXERCISES_3)
    for (let i = 0; i < 3; i++) {
      getStore().showFeedback(i % 2 === 0, '', 5)
      getStore().nextExercise()
    }
    expect(getStore().phase).toBe('complete')
  })
  it('does not advance past end (currentIndex stays at last)', () => {
    getStore().startLesson(EXERCISES_1)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    // Already complete — calling nextExercise again should not blow up
    const indexBefore = getStore().currentIndex
    getStore().nextExercise()
    // It tries next = 1, which is >= 1 (length), so goes to complete again
    expect(getStore().phase).toBe('complete')
    expect(getStore().currentIndex).toBe(indexBefore)
  })
  it('preserves correctCount and totalXpEarned across transitions', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, '', 10)
    getStore().nextExercise()
    getStore().showFeedback(false, 'x', 1)
    getStore().nextExercise()
    expect(getStore().correctCount).toBe(1)
    expect(getStore().totalXpEarned).toBe(11)
  })
})

// ─── resetLesson ─────────────────────────────────────────────────────────────

describe('resetLesson', () => {
  it('restores all state to initial values', () => {
    getStore().startLesson(EXERCISES_3)
    getStore().showFeedback(true, 'x', 10)
    getStore().nextExercise()
    getStore().resetLesson()
    const s = getStore()
    expect(s.exercises).toHaveLength(0)
    expect(s.currentIndex).toBe(0)
    expect(s.phase).toBe('intro')
    expect(s.correctCount).toBe(0)
    expect(s.totalXpEarned).toBe(0)
    expect(s.lastCorrect).toBeNull()
    expect(s.lastDisplayAnswer).toBeNull()
  })
  it('can reset from complete phase', () => {
    getStore().startLesson(EXERCISES_1)
    getStore().showFeedback(true, '', 5)
    getStore().nextExercise()
    expect(getStore().phase).toBe('complete')
    getStore().resetLesson()
    expect(getStore().phase).toBe('intro')
  })
})
