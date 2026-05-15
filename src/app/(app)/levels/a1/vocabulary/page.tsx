import { createClient } from '@/lib/supabase/server'
import { VocabularyBrowser } from '../../[level]/vocabulary/VocabularyBrowser'

export default async function A1VocabularyPage() {
  const supabase = await createClient()

  const { data: words } = await supabase
    .from('vocabulary')
    .select('id, french, english, ipa, gender, part_of_speech, theme, example_fr, example_en')
    .eq('level_code', 'A1')
    .order('theme')
    .order('french')

  const themes = [...new Set((words ?? []).map((w) => w.theme))].sort()

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-fg text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            A1 Vocabulary
          </h1>
          <p className="text-fg-muted mt-0.5 text-sm">
            {words?.length ?? 0} words across {themes.length} themes
          </p>
        </div>
        <VocabularyBrowser words={words ?? []} themes={themes} levelCode="A1" />
      </div>
    </div>
  )
}
