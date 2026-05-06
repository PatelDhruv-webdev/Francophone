// Central grading dispatcher.
// Takes an exercise row (with correct_answer — server-side only) and the user's answer.
// Returns whether it's correct + a sanitized display string for the feedback UI.

import {
  gradeMultipleChoice,
  gradeTypeAnswer,
  gradeFillInBlank,
  gradeWordOrder,
  gradeMatchPairs,
  type GradeResult,
} from './graders'
import type { ExerciseType, UserAnswer } from '@/types/exercises'

export type { GradeResult }

interface GradeInput {
  type: ExerciseType
  // correct_answer stored in DB — never sent to the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correct_answer: any
  answer: UserAnswer
}

export function grade({ type, correct_answer, answer }: GradeInput): GradeResult {
  switch (type) {
    case 'multiple_choice':
    case 'picture_choice':
      return gradeMultipleChoice(answer, Number(correct_answer))

    case 'type_answer':
    case 'conjugation':
      return gradeTypeAnswer(answer, String(correct_answer), { accentTolerant: true })

    case 'fill_in_blank': {
      const ca = Array.isArray(correct_answer)
        ? (correct_answer as string[])
        : [String(correct_answer)]
      return gradeFillInBlank(answer, ca)
    }

    case 'word_order': {
      const ca = Array.isArray(correct_answer)
        ? (correct_answer as string[])
        : String(correct_answer).split(' ')
      return gradeWordOrder(answer, ca)
    }

    case 'match_pairs':
      return gradeMatchPairs(answer, correct_answer as Record<string, number>)

    case 'listening_blank': {
      const ca = Array.isArray(correct_answer)
        ? (correct_answer as string[])
        : [String(correct_answer)]
      return gradeFillInBlank(answer, ca)
    }

    // Speaking is scored server-side via fuzzy word match — handled separately
    case 'speaking_repeat':
      return gradeTypeAnswer(answer, String(correct_answer), { accentTolerant: true })

    case 'reading_comprehension':
      return gradeMultipleChoice(answer, Number(correct_answer))

    default:
      return { correct: false, displayAnswer: '' }
  }
}
