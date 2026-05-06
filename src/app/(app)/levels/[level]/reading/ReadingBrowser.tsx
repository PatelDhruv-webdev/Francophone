'use client'

import { useState } from 'react'
import { BookOpen, Clock, ExternalLink } from 'lucide-react'

export type ReadingResource = {
  id: string
  title_fr: string
  title_en: string
  external_url: string
  level_code: string
  theme: string
  estimated_minutes: number
  order_index: number
}

interface Props {
  resources: ReadingResource[]
  completedIds: Set<string>
  level: string
  isAuthenticated: boolean
}

export function ReadingBrowser({ resources, completedIds, level: _level, isAuthenticated }: Props) {
  const [filter, setFilter] = useState('Tous')
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(completedIds))
  const [markingId, setMarkingId] = useState<string | null>(null)

  const themes = ['Tous', ...Array.from(new Set(resources.map((r) => r.theme))).sort()]

  const filtered = filter === 'Tous' ? resources : resources.filter((r) => r.theme === filter)

  async function handleMarkComplete(resourceId: string) {
    if (localCompleted.has(resourceId) || markingId === resourceId) return
    setMarkingId(resourceId)
    try {
      const res = await fetch(`/api/reading/${resourceId}/complete`, { method: 'POST' })
      if (res.ok) {
        setLocalCompleted((prev) => new Set([...prev, resourceId]))
      }
    } catch {
      // silently ignore — user can retry
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div>
      {/* Theme filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => setFilter(theme)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === theme
                ? 'bg-[#C24E2A] text-white'
                : 'border border-[rgba(30,27,22,0.15)] bg-white text-[#6B6460] hover:border-[#C24E2A]'
            }`}
          >
            {theme}
          </button>
        ))}
      </div>

      {/* Resource grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#A09890]" />
          <p className="text-sm text-[#6B6460]">Aucune ressource disponible pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => {
            const isCompleted = localCompleted.has(resource.id)
            const isMarking = markingId === resource.id

            return (
              <div
                key={resource.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(30,27,22,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(30,27,22,0.12)]"
              >
                {/* Completed badge */}
                {isCompleted && (
                  <div className="flex items-center gap-1.5 self-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2F7D52]/10 px-2 py-0.5 text-xs font-medium text-[#2F7D52]">
                      <span>✓</span>
                      <span>Lu</span>
                    </span>
                  </div>
                )}

                {/* Titles */}
                <div>
                  <h2
                    className="text-base leading-snug font-semibold text-[#1E1B16]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {resource.title_fr}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6B6460]">{resource.title_en}</p>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(30,27,22,0.1)] bg-[#F7F4EF] px-2 py-0.5 text-xs text-[#6B6460]">
                    {resource.theme}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#6B6460]">
                    <Clock className="h-3 w-3" />~{resource.estimated_minutes} min
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2 pt-1">
                  <a
                    href={resource.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C24E2A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A03D20]"
                  >
                    <span>Lire l&apos;histoire</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {isAuthenticated && !isCompleted && (
                    <button
                      onClick={() => handleMarkComplete(resource.id)}
                      disabled={isMarking}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2F7D52] px-4 py-2 text-sm font-medium text-[#2F7D52] transition-colors hover:bg-[#2F7D52]/5 disabled:opacity-50"
                    >
                      {isMarking ? 'En cours…' : 'Marquer comme lu'}
                    </button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-center text-xs text-[#A09890]">
                      Revenez marquer comme lu pour gagner 10 XP
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
