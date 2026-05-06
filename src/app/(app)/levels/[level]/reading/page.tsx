import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS } from '@/constants/levels'
import { ReadingBrowser } from './ReadingBrowser'

interface Props {
  params: Promise<{ level: string }>
}

export default async function ReadingPage({ params }: Props) {
  const { level } = await params
  const levelCode = level.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const supabase = await createClient()

  const { data: resources } = await supabase
    .from('reading_resources')
    .select('*')
    .eq('level_code', levelCode)
    .order('order_index')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let completedIds = new Set<string>()

  if (user) {
    const { data: progress } = await supabase
      .from('user_reading_progress')
      .select('resource_id')
      .eq('user_id', user.id)

    if (progress) {
      completedIds = new Set(progress.map((row) => row.resource_id as string))
    }
  }

  return (
    <div className="min-h-full bg-[#F7F4EF] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-[#1E1B16]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lectures — Niveau {levelCode}
          </h1>
          <p className="mt-0.5 text-sm text-[#6B6460]">
            {resources?.length ?? 0} ressource{(resources?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        <ReadingBrowser
          resources={resources ?? []}
          completedIds={completedIds}
          level={level}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  )
}
