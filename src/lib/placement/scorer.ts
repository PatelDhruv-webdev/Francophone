// Pure placement test scorer — no Supabase.

export type SkillArea = 'vocabulary' | 'grammar' | 'reading' | 'listening'

export interface PlacementAnswer {
  exerciseId: string
  correct: boolean
  difficulty: number // 1-5
  skillArea: SkillArea
  levelCode: string // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export interface PlacementResult {
  level: string // recommended CEFR level
  skillScores: Record<SkillArea, number> // 0-100
  totalScore: number // 0-100
  confidence: 'low' | 'medium' | 'high'
}

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function scorePlacement(answers: PlacementAnswer[]): PlacementResult {
  // ── Confidence ──────────────────────────────────────────────────────────────
  const confidence: PlacementResult['confidence'] =
    answers.length < 10 ? 'low' : answers.length <= 20 ? 'medium' : 'high'

  // ── Recommended level ───────────────────────────────────────────────────────
  // Group by level, calculate difficulty-weighted score per level
  const levelGroups = new Map<string, PlacementAnswer[]>()
  for (const answer of answers) {
    const existing = levelGroups.get(answer.levelCode)
    if (existing) {
      existing.push(answer)
    } else {
      levelGroups.set(answer.levelCode, [answer])
    }
  }

  // Walk levels in order. If a level was tested and failed (<60%), stop — the
  // student must consolidate that level before advancing. Levels with no
  // questions are skipped (treated as untested, chain continues).
  let recommendedLevel = 'A1'
  for (const level of LEVEL_ORDER) {
    const group = levelGroups.get(level)
    if (!group || group.length === 0) continue // no questions for this level — skip

    const totalWeight = group.reduce((sum: number, a) => sum + a.difficulty, 0)
    const correctWeight = group
      .filter((a) => a.correct)
      .reduce((sum: number, a) => sum + a.difficulty, 0)

    const pct = totalWeight > 0 ? correctWeight / totalWeight : 0
    if (pct >= 0.6) {
      recommendedLevel = level // passed — advance the recommendation
    } else {
      break // failed — stop here; don't advance past a gap
    }
  }

  // ── Skill scores ────────────────────────────────────────────────────────────
  const skillAreas: SkillArea[] = ['vocabulary', 'grammar', 'reading', 'listening']
  const skillScores = {} as Record<SkillArea, number>

  for (const skill of skillAreas) {
    const skillAnswers = answers.filter((a) => a.skillArea === skill)
    if (skillAnswers.length === 0) {
      skillScores[skill] = 0
    } else {
      const correct = skillAnswers.filter((a) => a.correct).length
      skillScores[skill] = Math.round((correct / skillAnswers.length) * 100)
    }
  }

  // ── Total score ─────────────────────────────────────────────────────────────
  const totalScore =
    answers.length === 0
      ? 0
      : Math.round((answers.filter((a) => a.correct).length / answers.length) * 100)

  return { level: recommendedLevel, skillScores, totalScore, confidence }
}
