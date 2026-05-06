'use client'

const LEVEL_COLORS: Record<string, string> = {
  A1: '#D4B896',
  A2: '#C4903C',
  B1: '#6B9E7A',
  B2: '#5A7FA0',
  C1: '#8B6B8B',
  C2: '#C4A35A',
}

interface Props {
  level: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
} as const

export function LevelBadge({ level, size = 'md' }: Props) {
  const bgColor = LEVEL_COLORS[level] ?? '#A09890'

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: bgColor,
        fontFamily: 'var(--font-display)',
      }}
      aria-label={`Niveau ${level}`}
    >
      {level}
    </div>
  )
}
