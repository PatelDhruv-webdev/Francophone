import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/types/api'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  // Parallel fetch all stats
  const [profileResult, activityResult, progressResult, attemptsResult] = await Promise.all([
    // 1. Profile — xp, streak_days, current_level
    supabase
      .from('profiles')
      .select('xp, streak_days, current_level, display_name, username')
      .eq('id', user.id)
      .single(),

    // 2. Last 30 days of daily_activity
    supabase
      .from('daily_activity')
      .select('xp_earned, activity_date, exercises_completed')
      .eq('user_id', user.id)
      .gte('activity_date', since)
      .order('activity_date'),

    // 3. Count completed lessons from user_progress (status = 'completed')
    supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),

    // 4. Count correct exercises from user_exercise_attempts
    supabase
      .from('user_exercise_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_correct', true),
  ])

  return NextResponse.json(
    apiSuccess({
      profile: profileResult.data ?? null,
      dailyActivity: activityResult.data ?? [],
      lessonsCompleted: progressResult.count ?? 0,
      correctExercises: attemptsResult.count ?? 0,
    }),
  )
}
