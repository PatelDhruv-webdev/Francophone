// Server-only. Runs inside API route handlers (never in client components).
// Updates profiles.xp and handles streak logic atomically via Supabase.

import { createAdminClient } from '@/lib/supabase/admin'
import { XP_REWARDS, type XpAction } from '@/constants/xp'

export interface AwardResult {
  xpAwarded: number
  newXp: number
  newStreak: number
  streakChanged: boolean
}

export async function awardXP(userId: string, action: XpAction): Promise<AwardResult> {
  const supabase = createAdminClient()
  const xpAwarded = XP_REWARDS[action]

  // Fetch current profile state
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('xp, streak_days, last_active_at')
    .eq('id', userId)
    .single()

  if (error || !profile) throw new Error(`Profile not found for ${userId}`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null
  if (lastActive) lastActive.setHours(0, 0, 0, 0)

  const msPerDay = 86_400_000
  const daysSinceLast = lastActive
    ? Math.floor((today.getTime() - lastActive.getTime()) / msPerDay)
    : null

  let newStreak = profile.streak_days
  let streakChanged = false

  if (daysSinceLast === null || daysSinceLast >= 2) {
    // First ever activity or missed 2+ days — reset streak
    newStreak = 1
    streakChanged = true
  } else if (daysSinceLast === 1) {
    // Consecutive day — increment
    newStreak = profile.streak_days + 1
    streakChanged = true
  }
  // daysSinceLast === 0 means already active today — streak stays the same

  const newXp = profile.xp + xpAwarded

  await supabase
    .from('profiles')
    .update({
      xp: newXp,
      streak_days: newStreak,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', userId)

  return { xpAwarded, newXp, newStreak, streakChanged }
}
