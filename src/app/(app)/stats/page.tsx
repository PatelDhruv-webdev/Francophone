import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsContent } from './StatsContent'

export const metadata: Metadata = { title: 'Statistiques · FrancoPath' }

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  const [profileResult, activityResult, progressResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('xp, streak_days, current_level, display_name')
      .eq('id', user.id)
      .single(),

    supabase
      .from('daily_activity')
      .select('xp_earned, activity_date, exercises_completed')
      .eq('user_id', user.id)
      .gte('activity_date', since)
      .order('activity_date'),

    supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),
  ])

  const profile = profileResult.data
  const dailyActivity = activityResult.data ?? []
  const lessonsCompleted = progressResult.count ?? 0

  return (
    <div className="bg-ivoire min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1
            className="text-encre text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mes statistiques
          </h1>
          <p className="text-gris-chaud mt-1">Votre progression sur les 30 derniers jours</p>
        </div>
        <StatsContent
          profile={profile ?? null}
          dailyActivity={dailyActivity}
          lessonsCompleted={lessonsCompleted}
        />
      </div>
    </div>
  )
}
