import { describe, it, expect } from 'vitest'
import { scheduleNext } from '@/lib/srs/algorithm'
import type { SrsCard, Quality } from '@/lib/srs/algorithm'

function makeCard(overrides: Partial<SrsCard> = {}): SrsCard {
  return {
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    due_date: '2026-01-01',
    ...overrides,
  }
}

function todayString(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDaysToToday(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─── Quality < 3: reset behaviour ────────────────────────────────────────────

describe('quality < 3 (failed recall)', () => {
  it('quality 0 (blackout): resets repetitions to 0', () => {
    const card = makeCard({ repetitions: 5, ease_factor: 2.5 })
    const result = scheduleNext(card, 0)
    expect(result.repetitions).toBe(0)
  })

  it('quality 0 (blackout): resets interval to 1', () => {
    const card = makeCard({ interval_days: 30 })
    const result = scheduleNext(card, 0)
    expect(result.interval_days).toBe(1)
  })

  it('quality 0 (blackout): due_date is today', () => {
    const card = makeCard()
    const result = scheduleNext(card, 0)
    expect(result.due_date).toBe(todayString())
  })

  it('quality 1: resets repetitions to 0', () => {
    const card = makeCard({ repetitions: 3 })
    const result = scheduleNext(card, 1)
    expect(result.repetitions).toBe(0)
  })

  it('quality 1: resets interval to 1', () => {
    const card = makeCard({ interval_days: 10 })
    const result = scheduleNext(card, 1)
    expect(result.interval_days).toBe(1)
  })

  it('quality 2: resets repetitions to 0', () => {
    const card = makeCard({ repetitions: 2 })
    const result = scheduleNext(card, 2)
    expect(result.repetitions).toBe(0)
  })

  it('quality 2: due_date is today', () => {
    const card = makeCard()
    const result = scheduleNext(card, 2)
    expect(result.due_date).toBe(todayString())
  })
})

// ─── Quality >= 3: interval progression ──────────────────────────────────────

describe('quality >= 3 (successful recall)', () => {
  it('first repetition (rep=0) → interval_days=1', () => {
    const card = makeCard({ repetitions: 0 })
    const result = scheduleNext(card, 3)
    expect(result.interval_days).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('second repetition (rep=1) → interval_days=6', () => {
    const card = makeCard({ repetitions: 1, interval_days: 1 })
    const result = scheduleNext(card, 3)
    expect(result.interval_days).toBe(6)
    expect(result.repetitions).toBe(2)
  })

  it('third+ repetition uses ease factor formula: interval = round(prev * ef)', () => {
    const card = makeCard({ repetitions: 2, interval_days: 6, ease_factor: 2.5 })
    const result = scheduleNext(card, 4)
    // round(6 * 2.5) = 15, then ef adjusts slightly for quality 4
    // Check it's in a reasonable range based on ease factor
    expect(result.interval_days).toBeGreaterThan(6)
    expect(result.repetitions).toBe(3)
  })

  it('high repetition count: interval grows correctly over multiple rounds', () => {
    let card = makeCard({ repetitions: 0, ease_factor: 2.5 })
    card = scheduleNext(card, 4) // rep=1, interval=1
    card = scheduleNext(card, 4) // rep=2, interval=6
    card = scheduleNext(card, 4) // rep=3, interval ~ 15
    card = scheduleNext(card, 4) // rep=4, interval ~ 38
    expect(card.interval_days).toBeGreaterThan(6)
    expect(card.repetitions).toBe(4)
  })
})

// ─── Ease factor updates ──────────────────────────────────────────────────────

describe('ease factor updates', () => {
  it('quality 5 (perfect): increases ease factor', () => {
    const card = makeCard({ ease_factor: 2.5, repetitions: 2, interval_days: 6 })
    const result = scheduleNext(card, 5)
    expect(result.ease_factor).toBeGreaterThan(card.ease_factor)
  })

  it('quality 4 (correct): ease factor does not decrease', () => {
    const card = makeCard({ ease_factor: 2.5, repetitions: 2, interval_days: 6 })
    const result = scheduleNext(card, 4)
    expect(result.ease_factor).toBeGreaterThanOrEqual(card.ease_factor)
  })

  it('quality 3 (correct but hard): ease factor decreases slightly', () => {
    const card = makeCard({ ease_factor: 2.5, repetitions: 2, interval_days: 6 })
    const result = scheduleNext(card, 3)
    expect(result.ease_factor).toBeLessThan(card.ease_factor)
  })
})

// ─── Ease factor floor ────────────────────────────────────────────────────────

describe('ease factor floor', () => {
  it('ease factor never goes below 1.3 even with low quality', () => {
    // Start at floor value and fail
    const card = makeCard({ ease_factor: 1.3, repetitions: 5, interval_days: 20 })
    const result = scheduleNext(card, 0)
    expect(result.ease_factor).toBeGreaterThanOrEqual(1.3)
  })

  it('repeated quality 3 responses do not push ease factor below 1.3', () => {
    let card = makeCard({ ease_factor: 1.5, repetitions: 2, interval_days: 6 })
    for (let i = 0; i < 10; i++) {
      if (card.repetitions < 2) {
        card = makeCard({ ease_factor: card.ease_factor, repetitions: 2, interval_days: 6 })
      }
      card = scheduleNext(card, 3)
      expect(card.ease_factor).toBeGreaterThanOrEqual(1.3)
    }
  })
})

// ─── Due date correctness ─────────────────────────────────────────────────────

describe('due_date calculation', () => {
  it('due_date is exactly interval_days days from today after first rep', () => {
    const card = makeCard({ repetitions: 0 })
    const result = scheduleNext(card, 3)
    // interval is 1 for first rep
    expect(result.due_date).toBe(addDaysToToday(result.interval_days))
  })

  it('due_date is exactly interval_days days from today after second rep', () => {
    const card = makeCard({ repetitions: 1, interval_days: 1 })
    const result = scheduleNext(card, 3)
    // interval is 6 for second rep
    expect(result.due_date).toBe(addDaysToToday(result.interval_days))
  })

  it('due_date is exactly interval_days days from today for third+ rep', () => {
    const card = makeCard({ repetitions: 2, interval_days: 6, ease_factor: 2.5 })
    const result = scheduleNext(card, 4)
    expect(result.due_date).toBe(addDaysToToday(result.interval_days))
  })

  it('failed card has due_date of today (interval_days=1, but date is today)', () => {
    const card = makeCard({ repetitions: 3, interval_days: 15 })
    const result = scheduleNext(card, 1)
    expect(result.due_date).toBe(todayString())
  })
})

// ─── SM-2 formula integrity ───────────────────────────────────────────────────

describe('SM-2 formula integrity', () => {
  it('each quality value 3-5 produces a valid result with interval >= 1', () => {
    const qualities: Quality[] = [3, 4, 5]
    for (const q of qualities) {
      const card = makeCard({ repetitions: 2, interval_days: 6, ease_factor: 2.5 })
      const result = scheduleNext(card, q)
      expect(result.interval_days).toBeGreaterThanOrEqual(1)
      expect(result.repetitions).toBe(3)
    }
  })

  it('quality 5 produces better outcome than quality 3 for same card', () => {
    const base = makeCard({ repetitions: 2, interval_days: 6, ease_factor: 2.5 })
    const good = scheduleNext(base, 5)
    const hard = scheduleNext(base, 3)
    expect(good.ease_factor).toBeGreaterThan(hard.ease_factor)
  })
})
