import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { Exercise } from '@/types/exercises'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch lesson with chapter → unit → level for breadcrumb / return path
  const { data: lesson } = await supabase
    .from('lessons')
    .select(
      `id, title, description,
       chapters(id, title, units(id, title, level_id, levels(code)))`,
    )
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  type ChapterNested = { units?: { levels?: { code?: string } | null } | null } | null
  const levelCode = (lesson.chapters as unknown as ChapterNested)?.units?.levels?.code ?? 'A1'

  // Fetch exercises via the public view (no correct_answer)
  const { data: rawExercises } = await supabase
    .from('exercises_public')
    .select('id, type, prompt, data, difficulty, level_code, tags, order_index')
    .eq('lesson_id', id)
    .order('order_index')

  if (!rawExercises || rawExercises.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1
          className="text-fg mb-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {lesson.title}
        </h1>
        <p className="text-fg-muted mb-6">No exercises have been added to this lesson yet.</p>
        <a
          href={`/levels/${levelCode.toLowerCase()}`}
          className="bg-brand hover:bg-brand-dark rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Back to {levelCode}
        </a>
      </div>
    )
  }

  const exercises = rawExercises as Exercise[]

  return (
    <div className="bg-bg min-h-screen">
      {/* Lesson header bar */}
      <div className="border-b border-[rgba(30,27,22,0.08)] bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <h1
            className="text-fg truncate text-base font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-fg-muted mt-0.5 truncate text-xs">{lesson.description}</p>
          )}
        </div>
      </div>

      {/* Exercise runner */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ExerciseRunner
          lessonId={id}
          exercises={exercises}
          returnPath={`/levels/${levelCode.toLowerCase()}`}
        />
      </div>
    </div>
  )
}
