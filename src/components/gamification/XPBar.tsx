'use client'

interface Props {
  xp: number
  levelThreshold: number
  label?: string
}

export function XPBar({ xp, levelThreshold, label }: Props) {
  const pct = levelThreshold > 0 ? Math.min((xp / levelThreshold) * 100, 100) : 0

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <span className="text-fg-muted text-xs font-medium">{label}</span>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5E6B8]">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={xp}
          aria-valuemin={0}
          aria-valuemax={levelThreshold}
        />
      </div>
      <span className="text-fg-subtle text-xs">
        {xp.toLocaleString()} / {levelThreshold.toLocaleString()} XP
      </span>
    </div>
  )
}
