// Server-side Supabase helper for lesson progress.
// Only imports from @supabase/supabase-js and @/types/database.

import { createAdminClient } from '@/lib/supabase/admin'

export interface LessonCompletionData {
  userId: string
  lessonId: string
  score: number // 0-100
  xpEarned: number
}

export async function markLessonComplete(data: LessonCompletionData): Promise<void> {
  const supabase = createAdminClient()
  const { userId, lessonId, score, xpEarned } = data

  const completedAt = new Date().toISOString()
  const activityDate = completedAt.slice(0, 10) // 'YYYY-MM-DD'

  // Upsert user_progress
  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: completedAt,
      xp_earned: xpEarned,
      score,
    },
    { onConflict: 'user_id,lesson_id' },
  )

  // Upsert daily_activity — increment xp_earned and lessons_completed for today
  const { data: existing } = await supabase
    .from('daily_activity')
    .select('xp_earned, lessons_completed')
    .eq('user_id', userId)
    .eq('activity_date', activityDate)
    .maybeSingle()

  await supabase.from('daily_activity').upsert(
    {
      user_id: userId,
      activity_date: activityDate,
      xp_earned: (existing?.xp_earned ?? 0) + xpEarned,
      lessons_completed: (existing?.lessons_completed ?? 0) + 1,
    },
    { onConflict: 'user_id,activity_date' },
  )
}

export async function getUserProgress(userId: string): Promise<{
  completedLessons: string[]
  totalXp: number
  streakDays: number
}> {
  const supabase = createAdminClient()

  const [profileResult, progressResult] = await Promise.all([
    supabase.from('profiles').select('xp, streak_days').eq('id', userId).single(),
    supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
  ])

  const profile = profileResult.data
  const progress = progressResult.data ?? []

  return {
    completedLessons: progress.map((row) => row.lesson_id),
    totalXp: profile?.xp ?? 0,
    streakDays: profile?.streak_days ?? 0,
  }
}
