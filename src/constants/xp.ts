export const XP_REWARDS = {
  EXERCISE_CORRECT: 5,
  EXERCISE_ATTEMPTED: 1, // wrong but tried
  LESSON_COMPLETE: 10,
  CHAPTER_QUIZ_PASS: 25,
  UNIT_TEST_PASS: 50,
  LEVEL_FINAL_PASS: 200,
  STREAK_DAY: 5,
  SRS_SESSION: 10, // 10+ cards reviewed
  WRITING_SUBMIT: 15,
  READING_COMPLETE: 10,
} as const

export type XpAction = keyof typeof XP_REWARDS

// Minimum XP per day to count toward streak
export const STREAK_MIN_XP = 10

// One streak freeze allowed per week
export const STREAK_FREEZE_DAYS = 1
