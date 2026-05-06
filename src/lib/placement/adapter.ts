// Maps raw DB exercise rows (from exercises_public view) + user answers
// into PlacementAnswer[] for the scorer.

import type { PlacementAnswer, SkillArea } from './scorer'

// Tags that map to skill areas
const SKILL_TAG_MAP: Record<string, SkillArea> = {
  vocabulary: 'vocabulary',
  vocab: 'vocabulary',
  grammar: 'grammar',
  reading: 'reading',
  listening: 'listening',
  comprehension: 'reading',
}

export interface RawExerciseResult {
  exerciseId: string
  correct: boolean
  exercise: {
    difficulty: number
    level_code: string
    tags: string[]
  }
}

export function adaptToPlacementAnswers(results: RawExerciseResult[]): PlacementAnswer[] {
  return results.map((result) => {
    const { exerciseId, correct, exercise } = result

    // Find the first tag that maps to a known skill area
    let skillArea: SkillArea = 'grammar'
    for (const tag of exercise.tags) {
      const mapped = SKILL_TAG_MAP[tag.toLowerCase()]
      if (mapped) {
        skillArea = mapped
        break
      }
    }

    return {
      exerciseId,
      correct,
      difficulty: exercise.difficulty,
      skillArea,
      levelCode: exercise.level_code,
    }
  })
}
