// Discriminated union types for exercise data payloads
// The `type` field determines which component renders and which grader runs.
// `correct_answer` is NEVER in these types — it's server-side only.

export type ExerciseType =
  | 'multiple_choice'
  | 'picture_choice'
  | 'type_answer'
  | 'fill_in_blank'
  | 'word_order'
  | 'match_pairs'
  | 'listening_blank'
  | 'speaking_repeat'
  | 'reading_comprehension'
  | 'conjugation'

export interface MultipleChoiceData {
  question: string
  options: string[]
}

export interface PictureChoiceData {
  image_url: string
  options: string[]
}

export interface TypeAnswerData {
  prompt: string
  case_sensitive?: boolean
  accent_tolerant?: boolean
  hint?: string
}

export interface FillInBlankData {
  sentence: string
  blanks: Array<{ index: number; hint?: string }>
}

export interface WordOrderData {
  english: string
  tokens: string[]
}

export interface MatchPairsData {
  left: string[]
  right: string[]
}

export interface ListeningBlankData {
  audio_url: string
  transcript_template: string
  blanks: Array<{ index: number }>
}

export interface SpeakingRepeatData {
  target_text: string
  audio_url?: string
}

export interface ReadingComprehensionQuestion {
  q: string
  options: string[]
  correct_index: number
}

export interface ReadingComprehensionData {
  text_id: string
  questions: ReadingComprehensionQuestion[]
}

export interface ConjugationData {
  verb: string
  tense: string
  subject: string
}

// Union of all data shapes — used to type exercise.data from the DB
export type ExerciseData =
  | MultipleChoiceData
  | PictureChoiceData
  | TypeAnswerData
  | FillInBlankData
  | WordOrderData
  | MatchPairsData
  | ListeningBlankData
  | SpeakingRepeatData
  | ReadingComprehensionData
  | ConjugationData

// The exercise row as returned from exercises_public view (no correct_answer)
export interface Exercise {
  id: string
  lesson_id: string | null
  type: ExerciseType
  prompt: string
  data: ExerciseData
  difficulty: number
  level_code: string
  tags: string[]
  order_index: number
}

// User's submitted answer — shape depends on exercise type
export type UserAnswer =
  | number // multiple_choice, picture_choice (index)
  | string // type_answer, fill_in_blank (single blank), conjugation
  | string[] // fill_in_blank (multi-blank), word_order (token array)
  | Record<string, number> // match_pairs { left_index: right_index }

export interface ExerciseSubmitRequest {
  exerciseId: string
  answer: UserAnswer
}

export interface ExerciseSubmitResponse {
  correct: boolean
  xpAwarded: number
  correctAnswer?: string // shown after attempt — sanitized display only
  explanation?: string
}
