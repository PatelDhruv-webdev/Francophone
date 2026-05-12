// Central grading dispatcher.
// Takes an exercise row (with correct_answer — server-side only) and the user's answer.
// Returns whether it's correct + a sanitized display string for the feedback UI.

import {
  gradeMultipleChoice,
  gradeTypeAnswer,
  gradeFillInBlank,
  gradeWordOrder,
  gradeMatchPairs,
  type AcceptedAnswer,
  type GradeResult,
} from './graders'
import type { ExerciseType, UserAnswer } from '@/types/exercises'

export type { GradeResult, AcceptedAnswer }

interface GradeInput {
  type: ExerciseType
  // correct_answer stored in DB — never sent to the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correct_answer: any
  answer: UserAnswer
}

// Heuristic: a JSON-from-DB shape for type_answer / conjugation may be a
// canonical string or a list of accepted variants (e.g. for reform-1990
// spelling). For fill_in_blank, each blank may itself be a list of variants.
function toAccepted(raw: unknown): AcceptedAnswer {
  if (Array.isArray(raw)) return raw.map((v) => String(v))
  return String(raw)
}

function toAcceptedList(raw: unknown): AcceptedAnswer[] {
  if (!Array.isArray(raw)) return [String(raw)]
  return raw.map((slot) => toAccepted(slot))
}

export function grade({ type, correct_answer, answer }: GradeInput): GradeResult {
  switch (type) {
    case 'multiple_choice':
    case 'picture_choice':
      return gradeMultipleChoice(answer, Number(correct_answer))

    case 'type_answer':
    case 'conjugation':
      return gradeTypeAnswer(answer, toAccepted(correct_answer), { accentTolerant: true })

    case 'fill_in_blank':
      return gradeFillInBlank(answer, toAcceptedList(correct_answer))

    case 'word_order': {
      const ca = Array.isArray(correct_answer)
        ? (correct_answer as string[])
        : String(correct_answer).split(' ')
      return gradeWordOrder(answer, ca)
    }

    case 'match_pairs':
      return gradeMatchPairs(answer, correct_answer as Record<string, number>)

    case 'listening_blank':
      return gradeFillInBlank(answer, toAcceptedList(correct_answer))

    // Speaking is scored server-side via fuzzy word match — handled separately
    case 'speaking_repeat':
      return gradeTypeAnswer(answer, toAccepted(correct_answer), { accentTolerant: true })

    case 'reading_comprehension':
      return gradeMultipleChoice(answer, Number(correct_answer))

    default:
      return { correct: false, displayAnswer: '' }
  }
}
