'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCardProps {
  streakDays: number
  xp: number
}

export function StreakCard({ streakDays, xp }: StreakCardProps) {
  const hasStreak = streakDays > 0

  return (
    <div className="shadow-card bg-card flex items-center gap-4 rounded-2xl p-5">
      <div
        className={cn(
          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
          hasStreak ? 'bg-[#FFF0E8]' : 'bg-muted',
        )}
      >
        <Flame
          className={cn(
            'h-6 w-6',
            hasStreak ? 'animate-glow-pulse text-[#E8612A]' : 'text-muted-foreground',
          )}
        />
      </div>
      <div>
        <p className="text-foreground text-2xl font-bold tabular-nums">
          {streakDays}
          <span className="text-muted-foreground ml-1 text-base font-semibold">
            {streakDays === 1 ? 'day' : 'days'}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">Current streak</p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-sm font-semibold text-[#D4970A] tabular-nums">{xp.toLocaleString()}</p>
        <p className="text-muted-foreground text-xs">Total XP</p>
      </div>
    </div>
  )
}
