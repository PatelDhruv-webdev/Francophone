import { normalize, normalizeForGrading } from './normalizer'
import { expandVariants, type SpellingPreference } from './spelling-variants'
import type { UserAnswer } from '@/types/exercises'

export interface GradeResult {
  correct: boolean
  // Sanitized display string shown to the user after answering (never the raw DB value)
  displayAnswer: string
}

// multiple_choice / picture_choice — answer is the chosen option index
export function gradeMultipleChoice(answer: UserAnswer, correctIndex: number): GradeResult {
  return {
    correct: answer === correctIndex,
    displayAnswer: String(correctIndex),
  }
}

export interface TypeAnswerOptions {
  caseSensitive?: boolean
  accentTolerant?: boolean // when true, é and e are treated as equal
  // When set, the correctAnswer is expanded through the 1990 reform-spelling
  // variant generator and any of the resulting forms is accepted. The caller
  // typically sources this from profiles.spelling_preference.
  spellingPreference?: SpellingPreference
}

// A "correct answer" may be a single canonical form or a list of accepted
// variants (e.g. ["connaître", "connaitre"]). The first entry is canonical
// and is used for displayAnswer.
export type AcceptedAnswer = string | readonly string[]

function asList(a: AcceptedAnswer): readonly string[] {
  return Array.isArray(a) ? a : [a as string]
}

function canonical(a: AcceptedAnswer): string {
  const list = asList(a)
  return list[0] ?? ''
}

// type_answer / conjugation — answer is a string. correctAnswer may be a
// single canonical form or a list of accepted variants (any-of). When
// options.spellingPreference is set, each variant is further expanded through
// the 1990 reform generator.
export function gradeTypeAnswer(
  answer: UserAnswer,
  correctAnswer: AcceptedAnswer,
  options: TypeAnswerOptions = {},
): GradeResult {
  const display = canonical(correctAnswer)
  if (typeof answer !== 'string') {
    return { correct: false, displayAnswer: display }
  }
  const prepped = normalizeForGrading(answer, options)
  const baseVariants = asList(correctAnswer)
  const allVariants = options.spellingPreference
    ? baseVariants.flatMap((v) => expandVariants(v, options.spellingPreference))
    : baseVariants
  const match = allVariants.some((variant) => normalizeForGrading(variant, options) === prepped)
  return { correct: match, displayAnswer: display }
}

// fill_in_blank — answer is string[] (one entry per blank). Each blank entry
// in correctAnswers may itself be a list of accepted variants for that blank.
export function gradeFillInBlank(
  answer: UserAnswer,
  correctAnswers: readonly AcceptedAnswer[],
): GradeResult {
  const displayBlanks = correctAnswers.map((c) => canonical(c))
  const displayAnswer = displayBlanks.join(' / ')
  if (!Array.isArray(answer) || answer.some((a) => typeof a !== 'string')) {
    return {
      correct: false,
      displayAnswer: correctAnswers.length === 0 ? '' : displayBlanks.join(', '),
    }
  }
  if (answer.length !== correctAnswers.length) {
    return { correct: false, displayAnswer }
  }
  const allCorrect = (answer as string[]).every((a, i) => {
    const slot = correctAnswers[i]
    if (slot === undefined) return false
    const prepped = normalize(a)
    return asList(slot).some((variant) => normalize(variant) === prepped)
  })
  return { correct: allCorrect, displayAnswer }
}

// word_order — answer is the ordered token array the user assembled
export function gradeWordOrder(answer: UserAnswer, correctTokens: string[]): GradeResult {
  if (!Array.isArray(answer)) {
    return { correct: false, displayAnswer: correctTokens.join(' ') }
  }
  const got = (answer as string[]).map(normalize).join(' ')
  const expected = correctTokens.map(normalize).join(' ')
  return {
    correct: got === expected,
    displayAnswer: correctTokens.join(' '),
  }
}

// match_pairs — answer is { leftIndex: rightIndex }
export function gradeMatchPairs(
  answer: UserAnswer,
  correctPairs: Record<string, number>,
): GradeResult {
  if (typeof answer !== 'object' || Array.isArray(answer)) {
    return { correct: false, displayAnswer: '' }
  }
  const pairs = answer as Record<string, number>
  const allCorrect = Object.entries(correctPairs).every(([k, v]) => pairs[k] === v)
  return { correct: allCorrect, displayAnswer: '' }
}
