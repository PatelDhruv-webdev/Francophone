'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  chapter_title: string
  level_code: string
  order_index: number
}

interface ContinueLearningCardProps {
  lesson: Lesson | null
  level: string
}

const LEVEL_COLORS: Record<string, string> = {
  A1: '#D4B896',
  A2: '#C4903C',
  B1: '#6B9E7A',
  B2: '#5A7FA0',
  C1: '#8B6B8B',
  C2: '#C4A35A',
}

export function ContinueLearningCard({ lesson, level }: ContinueLearningCardProps) {
  const color = LEVEL_COLORS[level.toUpperCase()] ?? '#C24E2A'

  if (!lesson) {
    return (
      <div className="shadow-card bg-card rounded-2xl p-5">
        <p className="text-foreground mb-1 text-sm font-semibold">Continue learning</p>
        <p className="text-muted-foreground mb-4 text-sm">
          You haven&apos;t started any lessons yet.
        </p>
        <Link
          href="/levels"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C24E2A] transition-colors hover:text-[#A03D20]"
        >
          Browse {level} lessons <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <Link
      href={`/lesson/${lesson.id}` as '/'}
      className="shadow-card bg-card hover:shadow-exercise group block rounded-2xl p-5 transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <BookOpen className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground truncate text-xs">{lesson.chapter_title}</p>
          <p className="text-foreground french-text mt-0.5 truncate text-sm font-semibold">
            {lesson.title}
          </p>
          <span
            className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {level}
          </span>
        </div>
        <ArrowRight className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0 transition-colors group-hover:text-[#C24E2A]" />
      </div>
    </Link>
  )
}
