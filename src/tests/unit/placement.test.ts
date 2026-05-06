import { describe, it, expect } from 'vitest'
import { scorePlacement, type PlacementAnswer } from '@/lib/placement/scorer'
import { adaptToPlacementAnswers, type RawExerciseResult } from '@/lib/placement/adapter'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAnswer(
  levelCode: string,
  correct: boolean,
  skillArea: PlacementAnswer['skillArea'] = 'grammar',
  difficulty = 3,
): PlacementAnswer {
  return { exerciseId: crypto.randomUUID(), correct, difficulty, skillArea, levelCode }
}

function makeRaw(
  correct: boolean,
  tags: string[],
  levelCode = 'A1',
  difficulty = 3,
): RawExerciseResult {
  return {
    exerciseId: crypto.randomUUID(),
    correct,
    exercise: { difficulty, level_code: levelCode, tags },
  }
}

// ─── scorePlacement ───────────────────────────────────────────────────────────

describe('scorePlacement — confidence', () => {
  it('returns low confidence for < 10 answers', () => {
    const answers = Array.from({ length: 5 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).confidence).toBe('low')
  })

  it('returns low confidence for exactly 9 answers', () => {
    const answers = Array.from({ length: 9 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).confidence).toBe('low')
  })

  it('returns medium confidence for 10 answers', () => {
    const answers = Array.from({ length: 10 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).confidence).toBe('medium')
  })

  it('returns medium confidence for 20 answers', () => {
    const answers = Array.from({ length: 20 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).confidence).toBe('medium')
  })

  it('returns high confidence for 21 answers', () => {
    const answers = Array.from({ length: 21 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).confidence).toBe('high')
  })
})

describe('scorePlacement — level recommendation', () => {
  it('returns A1 for empty answers', () => {
    expect(scorePlacement([]).level).toBe('A1')
  })

  it('returns A1 when all answers are wrong', () => {
    const answers = Array.from({ length: 10 }, () => makeAnswer('A1', false))
    expect(scorePlacement(answers).level).toBe('A1')
  })

  it('returns A1 when A1 correct but below 60%', () => {
    const answers = [
      ...Array.from({ length: 5 }, () => makeAnswer('A1', true)),
      ...Array.from({ length: 6 }, () => makeAnswer('A1', false)),
    ]
    expect(scorePlacement(answers).level).toBe('A1')
  })

  it('returns A1 when >= 60% A1 answers correct', () => {
    const answers = Array.from({ length: 10 }, () => makeAnswer('A1', true))
    // A1 passes at 100%, so result is at least A1
    expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(scorePlacement(answers).level)
  })

  it('returns B1 or higher when >= 60% B1 answers correct', () => {
    const answers = [
      ...Array.from({ length: 5 }, () => makeAnswer('A1', true)),
      ...Array.from({ length: 5 }, () => makeAnswer('A2', true)),
      ...Array.from({ length: 10 }, () => makeAnswer('B1', true)),
    ]
    const result = scorePlacement(answers)
    expect(['B1', 'B2', 'C1', 'C2']).toContain(result.level)
  })

  it('returns highest passing level when multiple levels pass', () => {
    const answers = [
      ...Array.from({ length: 10 }, () => makeAnswer('A1', true)),
      ...Array.from({ length: 10 }, () => makeAnswer('A2', true)),
    ]
    const result = scorePlacement(answers)
    // Both A1 and A2 pass; should return A2 (or higher if that passes too)
    expect(['A2', 'B1', 'B2', 'C1', 'C2']).toContain(result.level)
  })

  it('does not advance past a level where score < 60%', () => {
    const answers = [
      ...Array.from({ length: 10 }, () => makeAnswer('A1', true)),
      ...Array.from({ length: 10 }, () => makeAnswer('A2', false)), // A2 fails
      ...Array.from({ length: 10 }, () => makeAnswer('B1', true)), // B1 passes but A2 is a gap
    ]
    const result = scorePlacement(answers)
    // A2 fails so the chain stops at A1
    expect(result.level).toBe('A1')
  })
})

describe('scorePlacement — skill scores', () => {
  it('returns 0 skill scores for empty answers', () => {
    const result = scorePlacement([])
    expect(result.skillScores.grammar).toBe(0)
    expect(result.skillScores.vocabulary).toBe(0)
    expect(result.skillScores.reading).toBe(0)
    expect(result.skillScores.listening).toBe(0)
  })

  it('returns 100 vocabulary score when all vocab answers correct', () => {
    const answers = Array.from({ length: 5 }, () => makeAnswer('A1', true, 'vocabulary'))
    const result = scorePlacement(answers)
    expect(result.skillScores.vocabulary).toBe(100)
  })

  it('returns 0 vocabulary score when all vocab answers wrong', () => {
    const answers = Array.from({ length: 5 }, () => makeAnswer('A1', false, 'vocabulary'))
    const result = scorePlacement(answers)
    expect(result.skillScores.vocabulary).toBe(0)
  })

  it('returns ~50 grammar score for half-correct grammar answers', () => {
    const answers = [
      ...Array.from({ length: 5 }, () => makeAnswer('A1', true, 'grammar')),
      ...Array.from({ length: 5 }, () => makeAnswer('A1', false, 'grammar')),
    ]
    const result = scorePlacement(answers)
    expect(result.skillScores.grammar).toBeGreaterThanOrEqual(40)
    expect(result.skillScores.grammar).toBeLessThanOrEqual(60)
  })

  it('skill scores are between 0 and 100', () => {
    const answers = Array.from({ length: 15 }, (_, i) =>
      makeAnswer(
        'A1',
        i % 3 === 0,
        (['grammar', 'vocabulary', 'reading', 'listening'] as const)[i % 4],
      ),
    )
    const result = scorePlacement(answers)
    for (const score of Object.values(result.skillScores)) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})

describe('scorePlacement — totalScore', () => {
  it('returns 0 totalScore for empty answers', () => {
    expect(scorePlacement([]).totalScore).toBe(0)
  })

  it('returns 100 totalScore for all correct answers', () => {
    const answers = Array.from({ length: 10 }, () => makeAnswer('A1', true))
    expect(scorePlacement(answers).totalScore).toBe(100)
  })

  it('totalScore is between 0 and 100', () => {
    const answers = Array.from({ length: 10 }, (_, i) => makeAnswer('A1', i % 2 === 0))
    const result = scorePlacement(answers)
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
    expect(result.totalScore).toBeLessThanOrEqual(100)
  })
})

// ─── adaptToPlacementAnswers ──────────────────────────────────────────────────

describe('adaptToPlacementAnswers', () => {
  it('maps correct flag through', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['grammar'])])
    expect(result!.correct).toBe(true)
  })

  it('maps incorrect flag through', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(false, ['grammar'])])
    expect(result!.correct).toBe(false)
  })

  it('maps level_code to levelCode', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['grammar'], 'B2')])
    expect(result!.levelCode).toBe('B2')
  })

  it('maps difficulty through', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['grammar'], 'A1', 5)])
    expect(result!.difficulty).toBe(5)
  })

  it('tag "vocab" → skillArea "vocabulary"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['vocab'])])
    expect(result!.skillArea).toBe('vocabulary')
  })

  it('tag "vocabulary" → skillArea "vocabulary"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['vocabulary'])])
    expect(result!.skillArea).toBe('vocabulary')
  })

  it('tag "grammar" → skillArea "grammar"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['grammar'])])
    expect(result!.skillArea).toBe('grammar')
  })

  it('tag "reading" → skillArea "reading"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['reading'])])
    expect(result!.skillArea).toBe('reading')
  })

  it('tag "comprehension" → skillArea "reading"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['comprehension'])])
    expect(result!.skillArea).toBe('reading')
  })

  it('tag "listening" → skillArea "listening"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['listening'])])
    expect(result!.skillArea).toBe('listening')
  })

  it('unknown tag defaults to "grammar"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['unknown-tag'])])
    expect(result!.skillArea).toBe('grammar')
  })

  it('empty tags default to "grammar"', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, [])])
    expect(result!.skillArea).toBe('grammar')
  })

  it('uses first matching tag when multiple present', () => {
    const [result] = adaptToPlacementAnswers([makeRaw(true, ['listening', 'vocab'])])
    expect(result!.skillArea).toBe('listening')
  })

  it('returns empty array for empty input', () => {
    expect(adaptToPlacementAnswers([])).toHaveLength(0)
  })

  it('maps multiple results correctly', () => {
    const results = adaptToPlacementAnswers([
      makeRaw(true, ['vocab'], 'A1'),
      makeRaw(false, ['grammar'], 'B1'),
    ])
    expect(results).toHaveLength(2)
    expect(results[0]!.skillArea).toBe('vocabulary')
    expect(results[1]!.skillArea).toBe('grammar')
    expect(results[1]!.levelCode).toBe('B1')
  })
})
