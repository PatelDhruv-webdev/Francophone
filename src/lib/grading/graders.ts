import { normalize, stripAccents } from './normalizer'
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
}

// Normalize a string according to the given grading options.
// accentTolerant strips diacritics. caseSensitive preserves case.
function prep(
  s: string,
  { caseSensitive = false, accentTolerant = true }: TypeAnswerOptions,
): string {
  let v = s.trim().replace(/\s+/g, ' ')
  if (accentTolerant) v = stripAccents(v)
  if (!caseSensitive) v = v.toLowerCase()
  return v
}

// type_answer / conjugation — answer is a string
export function gradeTypeAnswer(
  answer: UserAnswer,
  correctAnswer: string,
  options: TypeAnswerOptions = {},
): GradeResult {
  if (typeof answer !== 'string') {
    return { correct: false, displayAnswer: correctAnswer }
  }
  return {
    correct: prep(answer, options) === prep(correctAnswer, options),
    displayAnswer: correctAnswer,
  }
}

// fill_in_blank — answer is string[] (one entry per blank)
export function gradeFillInBlank(answer: UserAnswer, correctAnswers: string[]): GradeResult {
  if (!Array.isArray(answer) || answer.some((a) => typeof a !== 'string')) {
    return { correct: false, displayAnswer: correctAnswers.join(', ') }
  }
  if (answer.length !== correctAnswers.length) {
    return { correct: false, displayAnswer: correctAnswers.join(' / ') }
  }
  const allCorrect = (answer as string[]).every(
    (a, i) => normalize(a) === normalize(correctAnswers[i] ?? ''),
  )
  return { correct: allCorrect, displayAnswer: correctAnswers.join(' / ') }
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
