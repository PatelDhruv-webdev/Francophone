import Link from 'next/link'
import { Lock, BookOpen, ChevronRight } from 'lucide-react'
import type { Route } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS, LEVEL_META } from '@/constants/levels'

interface LevelProgress {
  total_lessons: number
  completed_lessons: number
}

async function getLevelProgress(userId: string): Promise<Record<string, LevelProgress>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_progress')
    .select('lessons(chapters(units(level_id, levels(code))))')
    .eq('user_id', userId)
    .eq('completed', true)

  const result: Record<string, LevelProgress> = {}
  CEFR_LEVELS.forEach((lvl) => {
    result[lvl] = { total_lessons: 0, completed_lessons: 0 }
  })

  data?.forEach((row) => {
    type LessonNested = {
      chapters?: { units?: { levels?: { code?: string } | null } | null } | null
    } | null
    const code = (row.lessons as unknown as LessonNested)?.chapters?.units?.levels?.code
    if (code && result[code]) result[code].completed_lessons++
  })

  return result
}

export default async function LevelsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('current_level').eq('id', user.id).single()
    : { data: null }

  const currentLevel = profile?.current_level ?? 'A1'
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel as (typeof CEFR_LEVELS)[number])
  const progress = user ? await getLevelProgress(user.id) : {}

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-fg text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Niveaux CEFR
        </h1>
        <p className="text-fg-muted mt-1">
          Six levels from complete beginner to mastery — your French journey.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CEFR_LEVELS.map((level, index) => {
          const meta = LEVEL_META[level]
          const isUnlocked = index <= currentIndex
          const isCurrent = level === currentLevel
          const lvlProgress = progress[level]
          const pct =
            lvlProgress && lvlProgress.total_lessons > 0
              ? Math.round((lvlProgress.completed_lessons / lvlProgress.total_lessons) * 100)
              : 0

          return (
            <div key={level} className="relative">
              {isUnlocked ? (
                <Link
                  href={`/levels/${level.toLowerCase()}` as Route}
                  className="group block rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-5 shadow-[0_2px_8px_rgba(30,27,22,0.08)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(30,27,22,0.12)]"
                >
                  <LevelCard
                    level={level}
                    meta={meta}
                    isCurrent={isCurrent}
                    isUnlocked
                    pct={pct}
                    completed={lvlProgress?.completed_lessons ?? 0}
                    total={lvlProgress?.total_lessons ?? 0}
                  />
                </Link>
              ) : (
                <div className="block cursor-not-allowed rounded-xl border border-[rgba(30,27,22,0.06)] bg-white p-5 opacity-50 select-none">
                  <LevelCard
                    level={level}
                    meta={meta}
                    isCurrent={false}
                    isUnlocked={false}
                    pct={0}
                    completed={0}
                    total={0}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LevelCard({
  level,
  meta,
  isCurrent,
  isUnlocked,
  pct,
  completed,
  total,
}: {
  level: string
  meta: { title: string; description: string; color: string }
  isCurrent: boolean
  isUnlocked: boolean
  pct: number
  completed: number
  total: number
}) {
  return (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: meta.color }}
        >
          {isUnlocked ? level : <Lock className="h-4 w-4" />}
        </div>
        {isCurrent && (
          <span className="text-brand rounded-full bg-[#F5E8E3] px-2 py-0.5 text-xs font-medium">
            Current
          </span>
        )}
        {isUnlocked && !isCurrent && (
          <ChevronRight className="text-fg-subtle group-hover:text-brand h-4 w-4 transition-colors" />
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-fg text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {level}
          </span>
          <span className="text-fg-muted text-sm">{meta.title}</span>
        </div>
        <p className="text-fg-subtle mt-0.5 text-xs leading-relaxed">{meta.description}</p>
      </div>

      {isUnlocked && (
        <div>
          <div className="text-fg-muted mb-1 flex justify-between text-xs">
            {total > 0 ? (
              <>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {completed}/{total} lessons
                </span>
                <span>{pct}%</span>
              </>
            ) : (
              <span className="text-fg-subtle flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Start learning
              </span>
            )}
          </div>
          {total > 0 && (
            <div className="h-1.5 rounded-full bg-[#F5E6B8]">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
