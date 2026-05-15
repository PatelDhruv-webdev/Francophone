'use client'

import * as Icons from 'lucide-react'

interface Props {
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
}

export function AchievementBadge({
  title,
  description,
  icon,
  xpReward,
  unlocked,
  unlockedAt,
}: Props) {
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[icon]

  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-white p-4 transition-opacity ${
        unlocked
          ? 'border-[rgba(30,27,22,0.10)] opacity-100'
          : 'border-[rgba(30,27,22,0.07)] opacity-50'
      }`}
      style={{
        boxShadow: unlocked
          ? '0 2px 8px rgba(30,27,22,0.08), 0 0 0 1px rgba(30,27,22,0.05)'
          : 'none',
      }}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
          unlocked ? 'bg-[#F5E8E3]' : 'bg-[rgba(30,27,22,0.05)]'
        }`}
      >
        {IconComponent ? (
          <IconComponent
            className="h-5 w-5"
            style={{ color: unlocked ? 'var(--color-brand)' : 'var(--color-fg-subtle)' }}
            aria-hidden="true"
          />
        ) : (
          <span className="text-lg">🏅</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-fg text-sm leading-tight font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </p>
          <span className="text-accent flex-shrink-0 rounded-full bg-[#F5E6B8] px-2 py-0.5 text-xs font-semibold">
            +{xpReward} XP
          </span>
        </div>
        <p className="text-fg-muted mt-0.5 text-xs leading-relaxed">{description}</p>
        {unlocked && formattedDate && (
          <p className="text-fg-subtle mt-1 text-xs">Débloqué le {formattedDate}</p>
        )}
        {!unlocked && <p className="text-fg-subtle mt-1 text-xs italic">Pas encore débloqué</p>}
      </div>
    </div>
  )
}
