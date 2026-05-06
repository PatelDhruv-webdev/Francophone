import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Route } from 'next'
import { BookOpen, CheckCircle2, ChevronRight, BookMarked, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS, LEVEL_META } from '@/constants/levels'

interface Props {
  params: Promise<{ level: string }>
}

interface Lesson {
  id: string
  title: string
  description: string | null
  order_index: number
}

interface Chapter {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Unit {
  id: string
  title: string
  description: string | null
  order_index: number
  chapters: Chapter[]
}

async function getLevelData(levelCode: string, userId: string | null) {
  const supabase = await createClient()

  const { data: levelRow } = await supabase
    .from('levels')
    .select('id')
    .eq('code', levelCode)
    .single()

  if (!levelRow) return null

  const { data: units } = await supabase
    .from('units')
    .select(
      `id, title, description, order_index,
       chapters(id, title, order_index,
         lessons(id, title, description, order_index)
       )`,
    )
    .eq('level_id', levelRow.id)
    .order('order_index')

  if (!units) return null

  // Sort nested arrays — Supabase join types are opaque so we cast through unknown
  const sortedUnits: Unit[] = units.map((u) => ({
    ...u,
    chapters: ((u.chapters as unknown as Chapter[]) ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => ({
        ...c,
        lessons: ((c.lessons as unknown as Lesson[]) ?? []).sort(
          (a, b) => a.order_index - b.order_index,
        ),
      })),
  }))

  // Fetch completed lesson IDs for this user
  const completedLessonIds = new Set<string>()
  if (userId) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
    progress?.forEach((row) => completedLessonIds.add(row.lesson_id))
  }

  return { units: sortedUnits, completedLessonIds }
}

export default async function LevelPage({ params }: Props) {
  const { level: levelSlug } = await params
  const levelCode = levelSlug.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const meta = LEVEL_META[levelCode as (typeof CEFR_LEVELS)[number]]

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const levelData = await getLevelData(levelCode, user?.id ?? null)

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {levelCode}
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {meta.title}
            </h1>
            <p className="text-sm text-[#6B6460]">{meta.description}</p>
          </div>
        </div>

        {/* Quick-access tiles */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/levels/${levelSlug}/vocabulary` as Route}
            className="flex items-center gap-2 rounded-lg border border-[rgba(30,27,22,0.1)] bg-white px-4 py-2 text-sm font-medium text-[#1E1B16] transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A]"
          >
            <BookMarked className="h-4 w-4" />
            Vocabulary
          </Link>
          <Link
            href={`/levels/${levelSlug}/grammar` as Route}
            className="flex items-center gap-2 rounded-lg border border-[rgba(30,27,22,0.1)] bg-white px-4 py-2 text-sm font-medium text-[#1E1B16] transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A]"
          >
            <FileText className="h-4 w-4" />
            Grammar
          </Link>
        </div>
      </div>

      {/* Units */}
      {!levelData || levelData.units.length === 0 ? (
        <div className="rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#A09890]" />
          <p className="text-[#6B6460]">Content coming soon for this level.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {levelData.units.map((unit, unitIndex) => {
            const totalLessons = unit.chapters.flatMap((c) => c.lessons).length
            const completedInUnit = unit.chapters
              .flatMap((c) => c.lessons)
              .filter((l) => levelData.completedLessonIds.has(l.id)).length

            return (
              <div
                key={unit.id}
                className="overflow-hidden rounded-xl border border-[rgba(30,27,22,0.08)] bg-white shadow-[0_2px_8px_rgba(30,27,22,0.06)]"
              >
                {/* Unit header */}
                <div className="border-b border-[rgba(30,27,22,0.06)] px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-[#F5E8E3] px-2 py-0.5 text-xs font-medium text-[#C24E2A]">
                          Unit {unitIndex + 1}
                        </span>
                      </div>
                      <h2
                        className="text-lg font-semibold text-[#1E1B16]"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {unit.title}
                      </h2>
                      {unit.description && (
                        <p className="mt-0.5 text-sm text-[#6B6460]">{unit.description}</p>
                      )}
                    </div>
                    {totalLessons > 0 && (
                      <span className="mt-1 text-xs whitespace-nowrap text-[#6B6460]">
                        {completedInUnit}/{totalLessons}
                      </span>
                    )}
                  </div>
                  {totalLessons > 0 && (
                    <div className="mt-3 h-1 rounded-full bg-[#F5E6B8]">
                      <div
                        className="h-full rounded-full bg-[#D4970A] transition-all"
                        style={{ width: `${(completedInUnit / totalLessons) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Chapters */}
                <div className="divide-y divide-[rgba(30,27,22,0.04)]">
                  {unit.chapters.map((chapter, chapterIndex) => {
                    const completedInChapter = chapter.lessons.filter((l) =>
                      levelData.completedLessonIds.has(l.id),
                    ).length
                    const chapterDone =
                      completedInChapter === chapter.lessons.length && chapter.lessons.length > 0

                    return (
                      <div key={chapter.id} className="px-5 py-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[#1E1B16]">
                            <span className="mr-1.5 text-[#A09890]">
                              {unitIndex + 1}.{chapterIndex + 1}
                            </span>
                            {chapter.title}
                          </h3>
                          {chapterDone && (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#2F7D52]" />
                          )}
                        </div>

                        {/* Lessons */}
                        <div className="ml-4 space-y-1">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const done = levelData.completedLessonIds.has(lesson.id)
                            const lessonNumber = `${unitIndex + 1}.${chapterIndex + 1}.${lessonIndex + 1}`

                            return (
                              <Link
                                key={lesson.id}
                                href={`/lesson/${lesson.id}` as Route}
                                className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#F7F4EF]"
                              >
                                {done ? (
                                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#2F7D52]" />
                                ) : (
                                  <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-[#D4B896] transition-colors group-hover:border-[#C24E2A]" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#A09890]">{lessonNumber}</span>
                                    <span className="truncate text-sm text-[#1E1B16]">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  {lesson.description && (
                                    <p className="mt-0.5 truncate text-xs text-[#A09890]">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#A09890] opacity-0 transition-opacity group-hover:opacity-100" />
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
