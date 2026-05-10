'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DailyActivity = {
  activity_date: string
  xp_earned: number
  exercises_completed: number
}

type Profile = {
  xp: number
  streak_days: number
  current_level: string
  display_name: string | null
} | null

type Props = {
  profile: Profile
  dailyActivity: DailyActivity[]
  lessonsCompleted: number
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-5">
      <p className="text-gris-chaud mb-1 text-sm">{label}</p>
      <p
        className={`text-3xl font-bold ${accent ? 'text-terre-cuite' : 'text-encre'}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
    </div>
  )
}

// Format ISO date to short label: "4 mai" style
function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function StatsContent({ profile, dailyActivity, lessonsCompleted }: Props) {
  const chartData = dailyActivity.map((row) => ({
    date: shortDate(row.activity_date),
    xp: row.xp_earned,
  }))

  const totalXP = profile?.xp ?? 0
  const streak = profile?.streak_days ?? 0
  const level = profile?.current_level ?? '—'

  return (
    <div className="space-y-6">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="XP total" value={totalXP.toLocaleString('fr-FR')} accent />
        <StatCard label="Série en cours" value={`${streak} j`} />
        <StatCard label="Leçons terminées" value={lessonsCompleted} />
        <StatCard label="Niveau actuel" value={level} />
      </div>

      {/* XP history chart */}
      <div className="shadow-card rounded-2xl bg-white p-6">
        <h2
          className="text-encre mb-1 text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          XP gagnés — 30 derniers jours
        </h2>
        <p className="text-gris-chaud mb-6 text-sm">
          {dailyActivity.length > 0
            ? `${dailyActivity.length} jour${dailyActivity.length > 1 ? 's' : ''} d'activité`
            : 'Aucune activité enregistrée'}
        </p>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid rgba(30,27,22,0.08)',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(30,27,22,0.08)',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--color-fg)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--color-accent)' }}
                formatter={(v) => [`${v ?? 0} XP`, 'XP gagné']}
              />
              <Bar dataKey="xp" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gris-chaud flex h-40 items-center justify-center text-sm">
            Commencez à apprendre pour voir vos statistiques ici.
          </div>
        )}
      </div>

      {/* Daily breakdown — last 7 days */}
      {dailyActivity.length > 0 && (
        <div className="shadow-card rounded-2xl bg-white p-6">
          <h2
            className="text-encre mb-4 text-lg font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Détail récent
          </h2>
          <div className="divide-encre/5 divide-y">
            {[...dailyActivity]
              .reverse()
              .slice(0, 7)
              .map((row) => (
                <div
                  key={row.activity_date}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-encre text-sm font-medium">
                    {shortDate(row.activity_date)}
                  </span>
                  <div className="text-gris-chaud flex items-center gap-4 text-sm">
                    <span>
                      <span className="text-or-vif font-semibold">{row.xp_earned}</span> XP
                    </span>
                    <span>
                      <span className="text-terre-cuite font-semibold">
                        {row.exercises_completed}
                      </span>{' '}
                      exercices
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
