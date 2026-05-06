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
      {label && <span className="text-xs font-medium text-[#6B6460]">{label}</span>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5E6B8]">
        <div
          className="h-2 rounded-full bg-[#D4970A] transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={xp}
          aria-valuemin={0}
          aria-valuemax={levelThreshold}
        />
      </div>
      <span className="text-xs text-[#A09890]">
        {xp.toLocaleString()} / {levelThreshold.toLocaleString()} XP
      </span>
    </div>
  )
}
