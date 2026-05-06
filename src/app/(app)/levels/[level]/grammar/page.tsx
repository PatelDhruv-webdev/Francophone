import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Route } from 'next'
import { BookOpen, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS, LEVEL_META } from '@/constants/levels'

interface Props {
  params: Promise<{ level: string }>
}

export default async function GrammarListPage({ params }: Props) {
  const { level: levelSlug } = await params
  const levelCode = levelSlug.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const meta = LEVEL_META[levelCode as (typeof CEFR_LEVELS)[number]]
  const supabase = await createClient()

  const { data: topics } = await supabase
    .from('grammar_topics')
    .select('id, title, slug, explanation_md')
    .eq('level_code', levelCode)
    .order('order_index')

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {levelCode}
          </div>
          <span className="text-xs text-[#6B6460]">{meta.title}</span>
        </div>
        <h1
          className="text-2xl font-bold text-[#1E1B16]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Grammar Topics
        </h1>
        <p className="mt-0.5 text-sm text-[#6B6460]">{topics?.length ?? 0} topics</p>
      </div>

      {!topics || topics.length === 0 ? (
        <div className="rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#A09890]" />
          <p className="text-[#6B6460]">Grammar topics coming soon.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((topic, i) => (
            <Link
              key={topic.id}
              href={`/levels/${levelSlug}/grammar/${topic.slug}` as Route}
              className="group flex items-center gap-4 rounded-xl border border-[rgba(30,27,22,0.08)] bg-white px-4 py-3 transition-all hover:border-[#C24E2A]/30 hover:shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: meta.color }}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1E1B16]">{topic.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A09890] transition-colors group-hover:text-[#C24E2A]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
