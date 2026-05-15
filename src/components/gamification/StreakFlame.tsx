'use client'

import { Flame } from 'lucide-react'

interface Props {
  days: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
} as const

const TEXT_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
} as const

export function StreakFlame({ days, size = 'md' }: Props) {
  const isActive = days > 0
  const iconColor = isActive ? 'var(--color-streak)' : 'var(--color-fg-subtle)'
  const iconClass = isActive ? `${SIZE_CLASSES[size]} animate-glow-pulse` : SIZE_CLASSES[size]

  return (
    <div className="inline-flex items-center gap-1.5">
      <Flame className={iconClass} style={{ color: iconColor }} aria-hidden="true" />
      <span
        className={`font-semibold ${TEXT_CLASSES[size]}`}
        style={{ color: isActive ? 'var(--color-streak)' : 'var(--color-fg-subtle)' }}
      >
        {days}
      </span>
    </div>
  )
}
