// Pure streak computation extracted from awards.ts.
// No Supabase — importable from unit tests.

export function computeStreakUpdate(
  currentStreak: number,
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
    return { newStreak: currentStreak + 1, streakChanged: true }
  }
  // daysSinceLast === 0 — already active today
  return { newStreak: currentStreak, streakChanged: false }
}
