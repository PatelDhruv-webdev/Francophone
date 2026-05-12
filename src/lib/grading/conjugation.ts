// Phase 2.4 — Conjugation grader.
//
// Pure function. Given a verb detail object (fetched by the caller from the
// verbs service / table) plus a tense, person, and user answer, returns the
// usual { correct, displayAnswer } shape.
//
// We intentionally keep DB access out of src/lib/grading/** so the grader is
// trivially testable with inline fixtures. The caller layer (API route, drill
// service) is responsible for fetching the VerbDetail.

import { gradeTypeAnswer, type GradeResult } from './graders'
import type { SpellingPreference } from './spelling-variants'
import type { UserAnswer } from '@/types/exercises'

// Structural subset of verbs.service.VerbDetail — typed locally so the grader
// module has no dependency on the service layer.
export interface ConjugationLookup {
  infinitif?: string
  conjugations: Record<string, Record<string, string>>
}

export interface GradeConjugationInput {
  verb: ConjugationLookup
  tense: string
  person: string
  answer: UserAnswer
  spellingPreference?: SpellingPreference
  caseSensitive?: boolean
  accentTolerant?: boolean
}

// Person key aliases — we accept short pronouns ("il") and explicit forms
// ("il/elle"). Lookup tries the literal first, then falls back to common
// equivalents.
const PERSON_ALIASES: Record<string, readonly string[]> = {
  il: ['il', 'elle', 'on', 'il/elle', 'il/elle/on'],
  elle: ['elle', 'il', 'on', 'il/elle', 'il/elle/on'],
  on: ['on', 'il', 'elle', 'il/elle/on'],
  ils: ['ils', 'elles', 'ils/elles'],
  elles: ['elles', 'ils', 'ils/elles'],
}

function lookupForm(
  conjugations: Record<string, Record<string, string>>,
  tense: string,
  person: string,
): string | null {
  const slots = conjugations[tense]
  if (!slots) return null
  const direct = slots[person]
  if (direct) return direct
  const aliases = PERSON_ALIASES[person.toLowerCase()] ?? []
  for (const alias of aliases) {
    const v = slots[alias]
    if (v) return v
  }
  return null
}

export function gradeConjugation({
  verb,
  tense,
  person,
  answer,
  spellingPreference,
  caseSensitive,
  accentTolerant,
}: GradeConjugationInput): GradeResult {
  const form = lookupForm(verb.conjugations, tense, person)
  if (form === null) {
    // Caller asked for a (tense, person) combo the verb data doesn't have.
    // We return "wrong" with no display answer; the route layer can detect
    // this via displayAnswer === '' and decide whether to surface a 404.
    return { correct: false, displayAnswer: '' }
  }
  return gradeTypeAnswer(answer, form, {
    accentTolerant: accentTolerant ?? true,
    caseSensitive: caseSensitive ?? false,
    spellingPreference,
  })
}
