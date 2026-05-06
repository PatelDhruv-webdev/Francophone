import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardXP } from '@/lib/xp/awards'
import { apiError, apiSuccess } from '@/types/api'

const completeSchema = z.object({
  score: z.number().min(0).max(100),
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

  const parsed = completeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.message, 'BAD_REQUEST'), { status: 422 })
  }

  const { score } = parsed.data
  const { id } = await params
  const admin = createAdminClient()

  // Check if already completed
  const { data: existing } = await admin
    .from('user_listening_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', id)
    .single()

  if (existing) {
    return NextResponse.json(apiSuccess({ alreadyCompleted: true, xpAwarded: 0 }))
  }

  // Award partial or full XP based on score
  const xpAwarded = score >= 50 ? 10 : 5

  // Record completion
  await admin.from('user_listening_progress').insert({
    user_id: user.id,
    video_id: id,
    xp_awarded: xpAwarded,
    score,
  })

  // Update profile XP and streak
  await awardXP(user.id, 'LESSON_COMPLETE')

  return NextResponse.json(apiSuccess({ alreadyCompleted: false, xpAwarded, score }))
}
