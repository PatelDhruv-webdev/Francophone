// SM-2 spaced repetition algorithm
// Pure function — no Supabase, no imports from outside src/types.

// Quality values: 0=blackout, 1=wrong, 2=wrong but familiar, 3=correct+hard, 4=correct, 5=perfect
export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SrsCard {
  ease_factor: number // default 2.5, floor at 1.3
  interval_days: number // default 1
  repetitions: number // how many times reviewed
  due_date: string // ISO date string
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base: Date, days: number): string {
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return toLocalDateString(result)
}

export function scheduleNext(card: SrsCard, quality: Quality): SrsCard {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (quality < 3) {
    // Failed — reset
    return {
      ease_factor: Math.max(1.3, card.ease_factor),
      interval_days: 1,
      repetitions: 0,
      due_date: toLocalDateString(today),
    }
  }

  // quality >= 3 — successful recall
  let newInterval: number
  if (card.repetitions === 0) {
    newInterval = 1
  } else if (card.repetitions === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(card.interval_days * card.ease_factor)
  }

  const newEaseFactor = Math.max(
    1.3,
    card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  return {
    ease_factor: newEaseFactor,
    interval_days: newInterval,
    repetitions: card.repetitions + 1,
    due_date: addDays(today, newInterval),
  }
}
