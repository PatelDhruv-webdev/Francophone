import Link from 'next/link'
import type { Route } from 'next'
import { PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface WritingPrompt {
  id: string
  title: string
  instructions: string
  sentence_starters: string[]
  model_answer: string
  word_min: number
  word_max: number
  level_code: string
  theme: string
  topic: string
  sub_topic: string | null
  order_index: number
}

interface Props {
  params: Promise<{ level: string }>
}

export default async function WritingListPage({ params }: Props) {
  const { level } = await params
  const levelCode = level.toUpperCase()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: prompts } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('level_code', levelCode)
    .order('order_index')

  // Group prompts by topic
  const byTopic = (prompts ?? []).reduce<Map<string, WritingPrompt[]>>((map, prompt) => {
    const group = map.get(prompt.topic) ?? []
    group.push(prompt)
    map.set(prompt.topic, group)
    return map
  }, new Map())

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <PenLine className="h-5 w-5 text-[#C24E2A]" />
            <span className="text-xs font-medium tracking-wide text-[#6B6460] uppercase">
              {levelCode}
            </span>
          </div>
          <h1
            className="font-serif text-2xl font-bold text-[#1E1B16]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Exercices d&apos;écriture
          </h1>
          <p className="mt-1 text-sm text-[#6B6460]">
            {prompts?.length ?? 0} exercice{(prompts?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {user && (
          <Link
            href={'/writing/history' as Route}
            className="mt-1 flex items-center gap-1 text-sm text-[#C24E2A] hover:underline"
          >
            Voir mon historique →
          </Link>
        )}
      </div>

      {!prompts || prompts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
          <PenLine className="mx-auto mb-3 h-10 w-10 text-[#A09890]" />
          <p className="text-[#6B6460]">
            Aucun exercice d&apos;écriture disponible pour ce niveau.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byTopic.entries()).map(([topic, topicPrompts]) => (
            <section key={topic}>
              <h2
                className="mb-3 font-serif text-lg font-semibold text-[#1E1B16]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {topic}
              </h2>
              <div className="space-y-3">
                {topicPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3
                            className="font-serif font-semibold text-[#1E1B16]"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {prompt.title}
                          </h3>
                          {prompt.sub_topic && (
                            <span className="inline-flex items-center rounded-md border border-[#C24E2A]/20 bg-[#F5E8E3] px-2 py-0.5 text-xs font-medium text-[#C24E2A]">
                              {prompt.sub_topic}
                            </span>
                          )}
                        </div>
                        <p className="mb-3 line-clamp-2 text-sm text-[#6B6460]">
                          {prompt.instructions}
                        </p>
                        <p className="text-xs text-[#A09890]">
                          {prompt.word_min}–{prompt.word_max} mots
                        </p>
                      </div>
                      <Link
                        href={`/writing/${prompt.id}` as Route}
                        className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-[#C24E2A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A83D1F]"
                      >
                        Écrire →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
