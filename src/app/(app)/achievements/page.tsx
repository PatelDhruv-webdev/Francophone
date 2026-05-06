import type { Metadata } from 'next'
import React from 'react'
import { redirect } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ACHIEVEMENTS } from '@/constants/achievements'

export const metadata: Metadata = { title: 'Mes succès · FrancoPath' }

function AchievementIcon({ name }: { name: string }) {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  const Icon = icons[name]
  if (!Icon) return <LucideIcons.Star className="h-6 w-6" />
  return <Icon className="h-6 w-6" />
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's unlocked achievement slugs via join
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, achievements(slug)')
    .eq('user_id', user.id)

  const unlockedSlugs = new Set(
    (userAchievements ?? [])
      .map((ua) => {
        const ach = ua.achievements
        if (!ach) return null
        return Array.isArray(ach) ? ach[0]?.slug : (ach as { slug: string }).slug
      })
      .filter(Boolean) as string[],
  )

  const unlocked = ACHIEVEMENTS.filter((a) => unlockedSlugs.has(a.slug))
  const locked = ACHIEVEMENTS.filter((a) => !unlockedSlugs.has(a.slug))

  return (
    <div className="bg-ivoire min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-encre text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mes succès
          </h1>
          <p className="text-gris-chaud mt-1">
            {unlocked.length} / {ACHIEVEMENTS.length} débloqués
          </p>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-encre mb-4 text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Débloqués
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {unlocked.map((achievement) => (
                <div
                  key={achievement.slug}
                  className="shadow-card flex items-start gap-4 rounded-2xl bg-white p-5"
                >
                  <div className="bg-terre-cuite-light text-terre-cuite flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <AchievementIcon name={achievement.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-encre truncate font-semibold">{achievement.title}</p>
                      <span className="text-terre-cuite bg-terre-cuite-light shrink-0 rounded-full px-2 py-0.5 text-xs font-bold">
                        +{achievement.xp_reward} XP
                      </span>
                    </div>
                    <p className="text-gris-chaud mt-0.5 text-sm">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <section>
            <h2
              className="text-encre mb-4 text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              À débloquer
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {locked.map((achievement) => (
                <div
                  key={achievement.slug}
                  className="shadow-card flex items-start gap-4 rounded-2xl bg-white p-5 opacity-50 grayscale"
                >
                  <div className="bg-encre/8 text-pale flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <AchievementIcon name={achievement.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-encre truncate font-semibold">{achievement.title}</p>
                      <span className="text-pale bg-encre/5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold">
                        +{achievement.xp_reward} XP
                      </span>
                    </div>
                    <p className="text-gris-chaud mt-0.5 text-sm">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All unlocked edge case */}
        {locked.length === 0 && unlocked.length === ACHIEVEMENTS.length && (
          <div className="py-12 text-center">
            <div className="mb-4 text-5xl">🏆</div>
            <p className="text-encre text-lg font-semibold">Tous les succès débloqués — bravo !</p>
          </div>
        )}
      </div>
    </div>
  )
}
