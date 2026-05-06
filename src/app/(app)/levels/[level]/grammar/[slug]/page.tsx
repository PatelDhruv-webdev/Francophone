import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS } from '@/constants/levels'
import { GrammarContent } from './GrammarContent'

interface Props {
  params: Promise<{ level: string; slug: string }>
}

export default async function GrammarTopicPage({ params }: Props) {
  const { level: levelSlug, slug } = await params
  const levelCode = levelSlug.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const supabase = await createClient()

  const { data: topic } = await supabase
    .from('grammar_topics')
    .select('*')
    .eq('level_code', levelCode)
    .eq('slug', slug)
    .single()

  if (!topic) notFound()

  // Fetch prev/next topics for navigation
  const { data: allTopics } = await supabase
    .from('grammar_topics')
    .select('slug, title, order_index')
    .eq('level_code', levelCode)
    .order('order_index')

  const currentIdx = allTopics?.findIndex((t) => t.slug === slug) ?? -1
  const prevTopic = currentIdx > 0 ? allTopics![currentIdx - 1] : null
  const nextTopic =
    allTopics && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-[#A09890]">
        <Link
          href={`/levels/${levelSlug}` as Route}
          className="transition-colors hover:text-[#C24E2A]"
        >
          {levelCode}
        </Link>
        <span>/</span>
        <Link
          href={`/levels/${levelSlug}/grammar` as Route}
          className="transition-colors hover:text-[#C24E2A]"
        >
          Grammar
        </Link>
        <span>/</span>
        <span className="text-[#6B6460]">{topic.title}</span>
      </div>

      <GrammarContent topic={topic} levelSlug={levelSlug} />

      {/* Prev/Next navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-[rgba(30,27,22,0.08)] pt-6">
        {prevTopic ? (
          <Link
            href={`/levels/${levelSlug}/grammar/${prevTopic.slug}` as Route}
            className="flex items-center gap-2 text-sm text-[#6B6460] transition-colors hover:text-[#C24E2A]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{prevTopic.title}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic ? (
          <Link
            href={`/levels/${levelSlug}/grammar/${nextTopic.slug}` as Route}
            className="flex items-center gap-2 text-sm text-[#6B6460] transition-colors hover:text-[#C24E2A]"
          >
            <span className="hidden sm:inline">{nextTopic.title}</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
