import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/types/api'
import { scheduleNext } from '@/lib/srs/algorithm'
import type { Quality } from '@/lib/srs/algorithm'

const reviewSchema = z.object({
  cardId: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(apiError('Invalid JSON', 'BAD_REQUEST'), { status: 400 })
  }

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.message, 'BAD_REQUEST'), { status: 422 })
  }

  const { cardId, quality } = parsed.data

  // Fetch the card — use user client so RLS enforces ownership
  const { data: card, error: fetchError } = await supabase
    .from('srs_cards')
    .select('*')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !card) {
    return NextResponse.json(apiError('Card not found', 'NOT_FOUND'), { status: 404 })
  }

  // Compute next schedule via SM-2 algorithm
  const next = scheduleNext(
    {
      ease_factor: card.ease_factor,
      interval_days: card.interval_days,
      repetitions: card.repetitions,
      due_date: card.due_date,
    },
    quality as Quality,
  )

  // Update the card row
  const { data: updated, error: updateError } = await supabase
    .from('srs_cards')
    .update({
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_date: next.due_date,
      last_reviewed: new Date().toISOString(),
    })
    .eq('id', cardId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (updateError || !updated) {
    return NextResponse.json(apiError('Failed to update card', 'INTERNAL_ERROR'), { status: 500 })
  }

  return NextResponse.json(apiSuccess({ card: updated }))
}
