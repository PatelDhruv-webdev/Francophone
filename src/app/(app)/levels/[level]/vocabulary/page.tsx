import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS } from '@/constants/levels'
import { VocabularyBrowser } from './VocabularyBrowser'

interface Props {
  params: Promise<{ level: string }>
}

export default async function VocabularyPage({ params }: Props) {
  const { level: levelSlug } = await params
  const levelCode = levelSlug.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const supabase = await createClient()

  const { data: words } = await supabase
    .from('vocabulary')
    .select('id, french, english, ipa, gender, part_of_speech, theme, example_fr, example_en')
    .eq('level_code', levelCode)
    .order('theme')
    .order('french')

  const themes = [...new Set((words ?? []).map((w) => w.theme))].sort()

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-fg text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {levelCode} Vocabulary
          </h1>
          <p className="text-fg-muted mt-0.5 text-sm">
            {words?.length ?? 0} words across {themes.length} themes
          </p>
        </div>
        <VocabularyBrowser words={words ?? []} themes={themes} levelCode={levelCode} />
      </div>
    </div>
  )
}
