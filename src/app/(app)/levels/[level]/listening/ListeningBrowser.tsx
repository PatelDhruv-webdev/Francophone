'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { Clock, PlayCircle, LayoutGrid } from 'lucide-react'

interface ListeningVideo {
  id: string
  youtube_id: string
  title: string
  channel_name: string
  duration_seconds: number
  level_code: string
  theme: string
  description: string | null
  transcript: string | null
  exercises: unknown[]
  order_index: number
}

interface Props {
  videos: ListeningVideo[]
  themes: string[]
  completedVideoIds: string[]
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function ThemeLabel({ theme }: { theme: string }) {
  return <>{theme.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</>
}

function VideoCard({ video, completed }: { video: ListeningVideo; completed: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(30,27,22,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(30,27,22,0.12)]">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#F0EBE3]">
        <Image
          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100">
          <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
        </div>
        {completed && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#2F7D52] px-2 py-0.5 text-xs font-medium text-white">
            <span>✓</span>
            <span>Complété</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="mb-1 line-clamp-2 text-sm leading-snug font-semibold text-[#1E1B16]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {video.title}
        </h3>
        <p className="mb-3 text-xs text-[#6B6460]">{video.channel_name}</p>

        <div className="mt-auto mb-3 flex items-center gap-3">
          {/* Duration */}
          <span className="flex items-center gap-1 text-xs text-[#A09890]">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(video.duration_seconds)}
          </span>
          {/* Theme badge */}
          <span className="rounded-full bg-[#F7F4EF] px-2 py-0.5 text-xs text-[#6B6460] capitalize">
            <ThemeLabel theme={video.theme} />
          </span>
        </div>

        <Link
          href={`/listening/${video.id}` as Route}
          className="block w-full rounded-lg bg-[#C24E2A] px-4 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-[#A03D20]"
        >
          Regarder &amp; Pratiquer →
        </Link>
      </div>
    </div>
  )
}

export function ListeningBrowser({ videos, themes, completedVideoIds }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const completedSet = new Set(completedVideoIds)

  const filtered = selectedTheme ? videos.filter((v) => v.theme === selectedTheme) : videos

  return (
    <div>
      {/* Theme filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTheme(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedTheme
              ? 'bg-[#C24E2A] text-white'
              : 'border border-[rgba(30,27,22,0.15)] bg-white text-[#6B6460] hover:border-[#C24E2A]'
          }`}
        >
          Tous ({videos.length})
        </button>
        {themes.map((theme) => {
          const count = videos.filter((v) => v.theme === theme).length
          return (
            <button
              key={theme}
              onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTheme === theme
                  ? 'bg-[#C24E2A] text-white'
                  : 'border border-[rgba(30,27,22,0.15)] bg-white text-[#6B6460] hover:border-[#C24E2A]'
              }`}
            >
              <ThemeLabel theme={theme} /> ({count})
            </button>
          )
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[#A09890]">
          <LayoutGrid className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">Aucune vidéo pour ce thème.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} completed={completedSet.has(video.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
