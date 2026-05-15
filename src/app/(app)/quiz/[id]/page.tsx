import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Exercise } from '@/types/exercises'
import { QuizRunner } from './QuizRunner'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Chapter
  const { data: chapter } = await supabase
    .from('chapters')
    .select(
      `id, title,
       units(id, title, level_id, levels(code))`,
    )
    .eq('id', id)
    .single()

  if (!chapter) notFound()

  type UnitsNested = { levels?: { code?: string } | null } | null
  const levelCode = (chapter.units as unknown as UnitsNested)?.levels?.code ?? 'A1'

  // All exercises for lessons in this chapter
  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('id')
    .eq('chapter_id', id)
    .order('order_index')

  const lessonIds = (lessonRows ?? []).map((l) => l.id)

  let exercises: Exercise[] = []
  if (lessonIds.length > 0) {
    const { data: rawEx } = await supabase
      .from('exercises_public')
      .select('id, type, prompt, data, difficulty, level_code, tags, order_index')
      .in('lesson_id', lessonIds)
      .order('lesson_id')
      .order('order_index')

    exercises = (rawEx ?? []) as Exercise[]
  }

  // Sample at most 20 exercises for a quiz (diversify difficulty)
  const sampled = sampleExercises(exercises, 20)

  return (
    <div className="bg-bg min-h-screen">
      <QuizRunner
        chapterId={id}
        chapterTitle={chapter.title}
        levelCode={levelCode}
        exercises={sampled}
        returnPath={`/levels/${levelCode.toLowerCase()}`}
      />
    </div>
  )
}

function sampleExercises(exercises: Exercise[], max: number): Exercise[] {
  if (exercises.length <= max) return exercises
  // Take a balanced spread across available exercises
  const step = exercises.length / max
  return Array.from({ length: max }, (_, i) => exercises[Math.floor(i * step)]!)
}
