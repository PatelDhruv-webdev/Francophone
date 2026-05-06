import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { grade } from '@/lib/grading'
import { awardXP } from '@/lib/xp/awards'
import { XP_REWARDS } from '@/constants/xp'
import { apiError, apiSuccess } from '@/types/api'

const submitSchema = z.object({
  exerciseId: z.string().uuid(),
  answer: z.union([z.number(), z.string(), z.array(z.string()), z.record(z.string(), z.number())]),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth — must be signed in
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

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.message, 'BAD_REQUEST'), { status: 422 })
  }

  const { exerciseId, answer } = parsed.data
  const { id } = await params

  // Sanity check — exerciseId in body must match URL param
  if (exerciseId !== id) {
    return NextResponse.json(apiError('Exercise ID mismatch', 'BAD_REQUEST'), { status: 400 })
  }

  // Fetch the full exercise row (with correct_answer) using admin client — bypasses RLS
  const admin = createAdminClient()
  const { data: exercise, error: exErr } = await admin
    .from('exercises')
    .select('id, type, correct_answer, lesson_id, difficulty')
    .eq('id', exerciseId)
    .single()

  if (exErr || !exercise) {
    return NextResponse.json(apiError('Exercise not found', 'NOT_FOUND'), { status: 404 })
  }

  // Grade the answer
  const result = grade({
    type: exercise.type,
    correct_answer: exercise.correct_answer,
    answer,
  })

  // Award XP
  const xpAction = result.correct ? 'EXERCISE_CORRECT' : 'EXERCISE_ATTEMPTED'
  const xpAwarded = XP_REWARDS[xpAction]
  await awardXP(user.id, xpAction)

  // Record the attempt
  await admin.from('user_exercise_attempts').insert({
    user_id: user.id,
    exercise_id: exerciseId,
    answer: JSON.stringify(answer),
    correct: result.correct,
    xp_earned: xpAwarded,
  })

  return NextResponse.json(
    apiSuccess({
      correct: result.correct,
      xpAwarded,
      // Only expose the display answer after the attempt — never the raw DB value
      correctAnswer: result.correct ? undefined : result.displayAnswer,
    }),
  )
}
