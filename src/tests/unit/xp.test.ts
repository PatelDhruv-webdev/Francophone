import { describe, it, expect } from 'vitest'
import { XP_REWARDS, STREAK_MIN_XP, STREAK_FREEZE_DAYS } from '@/constants/xp'

// ─── XP constants ─────────────────────────────────────────────────────────────

describe('XP constants', () => {
  it('EXERCISE_CORRECT > EXERCISE_ATTEMPTED', () => {
    expect(XP_REWARDS.EXERCISE_CORRECT).toBeGreaterThan(XP_REWARDS.EXERCISE_ATTEMPTED)
  })
  it('LESSON_COMPLETE is non-zero positive', () => {
    expect(XP_REWARDS.LESSON_COMPLETE).toBeGreaterThan(0)
  })
  it('CHAPTER_QUIZ_PASS > LESSON_COMPLETE', () => {
    expect(XP_REWARDS.CHAPTER_QUIZ_PASS).toBeGreaterThan(XP_REWARDS.LESSON_COMPLETE)
  })
  it('UNIT_TEST_PASS > CHAPTER_QUIZ_PASS', () => {
    expect(XP_REWARDS.UNIT_TEST_PASS).toBeGreaterThan(XP_REWARDS.CHAPTER_QUIZ_PASS)
  })
  it('LEVEL_FINAL_PASS > UNIT_TEST_PASS', () => {
    expect(XP_REWARDS.LEVEL_FINAL_PASS).toBeGreaterThan(XP_REWARDS.UNIT_TEST_PASS)
  })
  it('STREAK_MIN_XP is reachable in a normal session (>= 2 correct answers)', () => {
    expect(XP_REWARDS.EXERCISE_CORRECT * 2).toBeGreaterThanOrEqual(STREAK_MIN_XP)
  })
  it('all rewards are positive integers', () => {
    for (const [key, value] of Object.entries(XP_REWARDS)) {
      expect(value, `${key} should be > 0`).toBeGreaterThan(0)
      expect(value, `${key} should be an integer`).toBe(Math.floor(value))
    }
  })
  it('STREAK_FREEZE_DAYS is 1 (one freeze per week)', () => {
    expect(STREAK_FREEZE_DAYS).toBe(1)
  })
  it('EXERCISE_ATTEMPTED is less than LESSON_COMPLETE', () => {
    // Completing a lesson gives more XP than a single attempt
    expect(XP_REWARDS.EXERCISE_ATTEMPTED).toBeLessThan(XP_REWARDS.LESSON_COMPLETE)
  })
})

// ─── Streak logic (pure simulation — mirrors lib/xp/awards.ts) ────────────────
//
// Rules:
//  daysSinceLast === null || >= 2  → reset to 1
//  daysSinceLast === 1             → increment
//  daysSinceLast === 0             → no change (already active today)

function simulateStreakUpdate(
  streakDays: number,
  lastActiveDate: Date | null,
  now: Date,
): { newStreak: number; streakChanged: boolean } {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const lastActive = lastActiveDate ? new Date(lastActiveDate) : null
  if (lastActive) lastActive.setHours(0, 0, 0, 0)

  const msPerDay = 86_400_000
  const daysSinceLast = lastActive
    ? Math.floor((today.getTime() - lastActive.getTime()) / msPerDay)
    : null

  if (daysSinceLast === null || daysSinceLast >= 2) {
    return { newStreak: 1, streakChanged: true }
  } else if (daysSinceLast === 1) {
    return { newStreak: streakDays + 1, streakChanged: true }
  }
  return { newStreak: streakDays, streakChanged: false }
}

describe('streak logic', () => {
  const today = new Date('2026-04-30T10:00:00Z')
  const yesterday = new Date('2026-04-29T10:00:00Z')
  const twoDaysAgo = new Date('2026-04-28T10:00:00Z')
  const threeDaysAgo = new Date('2026-04-27T10:00:00Z')

  // ── Basic transitions ──────────────────────────────────────────────────────

  it('first ever activity (null lastActive) starts streak at 1', () => {
    const r = simulateStreakUpdate(0, null, today)
    expect(r.newStreak).toBe(1)
    expect(r.streakChanged).toBe(true)
  })
  it('consecutive day increments streak', () => {
    const r = simulateStreakUpdate(5, yesterday, today)
    expect(r.newStreak).toBe(6)
    expect(r.streakChanged).toBe(true)
  })
  it('same-day activity keeps streak unchanged', () => {
    const r = simulateStreakUpdate(5, today, today)
    expect(r.newStreak).toBe(5)
    expect(r.streakChanged).toBe(false)
  })
  it('missing exactly 2 days resets streak to 1', () => {
    const r = simulateStreakUpdate(10, twoDaysAgo, today)
    expect(r.newStreak).toBe(1)
    expect(r.streakChanged).toBe(true)
  })
  it('missing 3 days resets streak to 1', () => {
    const r = simulateStreakUpdate(10, threeDaysAgo, today)
    expect(r.newStreak).toBe(1)
    expect(r.streakChanged).toBe(true)
  })
  it('long gap (year) resets streak regardless of how long it was', () => {
    const longAgo = new Date('2025-01-01T00:00:00Z')
    const r = simulateStreakUpdate(365, longAgo, today)
    expect(r.newStreak).toBe(1)
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('streak_days = 0 with consecutive day → becomes 1', () => {
    const r = simulateStreakUpdate(0, yesterday, today)
    expect(r.newStreak).toBe(1)
    expect(r.streakChanged).toBe(true)
  })
  it('streak_days = 1 with consecutive day → becomes 2', () => {
    const r = simulateStreakUpdate(1, yesterday, today)
    expect(r.newStreak).toBe(2)
  })
  it('very high streak (100) increments correctly', () => {
    const r = simulateStreakUpdate(100, yesterday, today)
    expect(r.newStreak).toBe(101)
  })
  it('streak = 0 + same day → streak stays 0 (already counted today)', () => {
    const r = simulateStreakUpdate(0, today, today)
    expect(r.newStreak).toBe(0)
    expect(r.streakChanged).toBe(false)
  })

  // ── Timezone / midnight boundary ───────────────────────────────────────────

  it('last active at 23:59 yesterday counts as yesterday (consecutive)', () => {
    const lateYesterday = new Date('2026-04-29T23:59:59Z')
    const r = simulateStreakUpdate(5, lateYesterday, today)
    expect(r.newStreak).toBe(6)
  })
  it('last active at noon today counts as today (no change)', () => {
    // Use noon UTC so the date is unambiguously the same local calendar day
    // in any timezone between UTC-11 and UTC+11
    const noonToday = new Date('2026-04-30T12:00:00Z')
    const nowLate = new Date('2026-04-30T18:00:00Z')
    const r = simulateStreakUpdate(5, noonToday, nowLate)
    expect(r.newStreak).toBe(5)
    expect(r.streakChanged).toBe(false)
  })
  it('last active exactly 48h ago is treated as 2 days → reset', () => {
    // today = Apr 30 00:00, lastActive = Apr 28 00:00 → exactly 2 days
    const exactlyTwoDays = new Date('2026-04-28T00:00:00Z')
    const nowMidnight = new Date('2026-04-30T00:00:00Z')
    const r = simulateStreakUpdate(7, exactlyTwoDays, nowMidnight)
    expect(r.newStreak).toBe(1)
  })
  it('last active 25h ago but same calendar day difference (1) → increments', () => {
    // e.g. Apr 29 09:00 → Apr 30 10:00 = 1 calendar day
    const last = new Date('2026-04-29T09:00:00Z')
    const now = new Date('2026-04-30T10:00:00Z')
    const r = simulateStreakUpdate(3, last, now)
    expect(r.newStreak).toBe(4)
  })

  // ── Leap year / month boundary ─────────────────────────────────────────────

  it('Feb 28 → Mar 1 in a non-leap year is consecutive', () => {
    const feb28 = new Date('2025-02-28T12:00:00Z')
    const mar1 = new Date('2025-03-01T12:00:00Z')
    const r = simulateStreakUpdate(10, feb28, mar1)
    expect(r.newStreak).toBe(11)
  })
  it('Feb 29 → Mar 1 in a leap year is consecutive', () => {
    const feb29 = new Date('2024-02-29T12:00:00Z')
    const mar1 = new Date('2024-03-01T12:00:00Z')
    const r = simulateStreakUpdate(10, feb29, mar1)
    expect(r.newStreak).toBe(11)
  })
  it('Dec 31 → Jan 1 year boundary is consecutive', () => {
    const dec31 = new Date('2025-12-31T12:00:00Z')
    const jan1 = new Date('2026-01-01T12:00:00Z')
    const r = simulateStreakUpdate(30, dec31, jan1)
    expect(r.newStreak).toBe(31)
  })
  it('Dec 31 → Jan 2 (missed a day) resets', () => {
    const dec31 = new Date('2025-12-31T12:00:00Z')
    const jan2 = new Date('2026-01-02T12:00:00Z')
    const r = simulateStreakUpdate(30, dec31, jan2)
    expect(r.newStreak).toBe(1)
  })
})
