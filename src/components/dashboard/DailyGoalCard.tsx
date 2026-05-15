'use client'

import { Progress } from '@/components/ui/progress'
import { STREAK_MIN_XP } from '@/constants/xp'

interface DailyGoalCardProps {
  xpToday: number
}

export function DailyGoalCard({ xpToday }: DailyGoalCardProps) {
  const goal = STREAK_MIN_XP
  const pct = Math.min(100, Math.round((xpToday / goal) * 100))
  const done = xpToday >= goal

  return (
    <div className="shadow-card bg-card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-foreground text-sm font-semibold">Daily goal</p>
        <span
          className={
            done ? 'text-xs font-semibold text-[#2F7D52]' : 'text-muted-foreground text-xs'
          }
        >
          {done ? '✓ Complete' : `${xpToday} / ${goal} XP`}
        </span>
      </div>
      <Progress
        value={pct}
        className="h-3 bg-[#F5E6B8]"
        // Override the fill via CSS variable (Tailwind v4 pattern)
        style={{ '--progress-fill': 'var(--color-accent)' } as React.CSSProperties}
      />
      <p className="text-muted-foreground mt-2 text-xs">
        Earn {goal} XP daily to keep your streak alive
      </p>
    </div>
  )
}
