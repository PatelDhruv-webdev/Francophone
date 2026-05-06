// Server-side SRS card service.

import { createAdminClient } from '@/lib/supabase/admin'
import { scheduleNext, type Quality } from '@/lib/srs/algorithm'

export interface SrsCardRow {
  id: string
  user_id: string
  item_type: string
  item_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  due_date: string
  last_reviewed_at: string | null
}

export async function getDueCards(userId: string, limit = 20): Promise<SrsCardRow[]> {
  const supabase = createAdminClient()

  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  const { data, error } = await supabase
    .from('srs_cards')
    .select(
      'id, user_id, item_type, item_id, ease_factor, interval_days, repetitions, due_date, last_reviewed_at',
    )
    .eq('user_id', userId)
    .lte('due_date', today)
    .order('due_date', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`getDueCards failed: ${error.message}`)
  return (data ?? []) as SrsCardRow[]
}

export async function updateCard(cardId: string, quality: Quality): Promise<SrsCardRow> {
  const supabase = createAdminClient()

  // Fetch current card
  const { data: card, error: fetchError } = await supabase
    .from('srs_cards')
    .select(
      'id, user_id, item_type, item_id, ease_factor, interval_days, repetitions, due_date, last_reviewed_at',
    )
    .eq('id', cardId)
    .single()

  if (fetchError || !card) throw new Error(`Card not found: ${cardId}`)

  const next = scheduleNext(
    {
      ease_factor: card.ease_factor,
      interval_days: card.interval_days,
      repetitions: card.repetitions,
      due_date: card.due_date,
    },
    quality,
  )

  const { data: updated, error: updateError } = await supabase
    .from('srs_cards')
    .update({
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_date: next.due_date,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select(
      'id, user_id, item_type, item_id, ease_factor, interval_days, repetitions, due_date, last_reviewed_at',
    )
    .single()

  if (updateError || !updated) throw new Error(`updateCard failed: ${updateError?.message}`)
  return updated as SrsCardRow
}

export async function createCard(
  userId: string,
  itemType: string,
  itemId: string,
): Promise<SrsCardRow> {
  const supabase = createAdminClient()

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('srs_cards')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 0,
      due_date: today,
    })
    .select(
      'id, user_id, item_type, item_id, ease_factor, interval_days, repetitions, due_date, last_reviewed_at',
    )
    .single()

  if (error || !data) throw new Error(`createCard failed: ${error?.message}`)
  return data as SrsCardRow
}
