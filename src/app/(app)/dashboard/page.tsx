import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard'
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard'

export const metadata: Metadata = { title: 'Dashboard — FrancoPath' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, xp, streak_days, current_level, last_active_at')
    .eq('id', user.id)
    .single()

  // XP earned today — sum from daily_activity
  const today = new Date().toISOString().slice(0, 10)
  const { data: activity } = await supabase
    .from('daily_activity')
    .select('xp_earned')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single()

  const xpToday = activity?.xp_earned ?? 0

  // Next lesson to continue — find the first incomplete lesson at the user's level
  const { data: nextLesson } = await supabase
    .from('lessons')
    .select(
      `
      id, title, order_index,
      chapters!inner(title, units!inner(level_code))
    `,
    )
    .eq('chapters.units.level_code', profile?.current_level ?? 'A1')
    .not(
      'id',
      'in',
      supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true),
    )
    .order('order_index')
    .limit(1)
    .maybeSingle()

  const displayName = profile?.display_name ?? profile?.username ?? 'there'
  const level = profile?.current_level ?? 'A1'

  const lessonData = nextLesson
    ? {
        id: nextLesson.id,
        title: nextLesson.title,
        chapter_title: Array.isArray(nextLesson.chapters)
          ? (nextLesson.chapters[0]?.title ?? '')
          : '',
        level_code: level,
        order_index: nextLesson.order_index,
      }
    : null

  return (
    <div className="mx-auto max-w-2xl p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-foreground text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Bonjour, {displayName} !
        </h1>
        <p className="text-muted-foreground mt-1">Ready to practice some French today?</p>
      </div>

      {/* Dashboard cards */}
      <div className="flex flex-col gap-4">
        <ContinueLearningCard lesson={lessonData} level={level} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StreakCard streakDays={profile?.streak_days ?? 0} xp={profile?.xp ?? 0} />
          <DailyGoalCard xpToday={xpToday} />
        </div>
      </div>
    </div>
  )
}
