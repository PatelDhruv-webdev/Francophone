import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewSession } from './ReviewSession'

export const metadata: Metadata = { title: 'Révision · FrancoPath' }

export type SrsCardWithVocab = {
  id: string
  user_id: string
  item_type: string
  item_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  due_date: string
  last_reviewed: string | null
  vocabulary: {
    french: string
    english: string
    example_fr: string | null
  } | null
}

export default async function ReviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: cards } = await supabase
    .from('srs_cards')
    .select('*, vocabulary(french, english, example_fr)')
    .eq('user_id', user.id)
    .lte('due_date', today)
    .order('due_date')
    .limit(20)

  return (
    <div className="bg-ivoire min-h-screen">
      <ReviewSession cards={(cards ?? []) as SrsCardWithVocab[]} />
    </div>
  )
}
