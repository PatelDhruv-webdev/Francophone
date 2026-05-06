import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardXP } from '@/lib/xp/awards'
import { apiError, apiSuccess } from '@/types/api'

const submitSchema = z.object({
  content: z.string().min(1).max(5000),
  wordCount: z.number().int().min(1),
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

  const { content, wordCount } = parsed.data
  const { id } = await params
  const admin = createAdminClient()

  // Fetch the writing prompt to validate word count requirement
  const { data: prompt, error: promptErr } = await admin
    .from('writing_prompts')
    .select('id, word_min, word_max')
    .eq('id', id)
    .single()

  if (promptErr || !prompt) {
    return NextResponse.json(apiError('Writing prompt not found', 'NOT_FOUND'), { status: 404 })
  }

  // Validate minimum word count
  if (wordCount < prompt.word_min) {
    return NextResponse.json(
      apiError(`Votre texte est trop court (minimum ${prompt.word_min} mots)`, 'BAD_REQUEST'),
      { status: 422 },
    )
  }

  // Strip HTML tags from content
  const cleanContent = content.replace(/<[^>]*>/g, '').trim()

  const xpAwarded = 15

  // Record submission
  await admin.from('writing_submissions').insert({
    user_id: user.id,
    prompt_id: id,
    content: cleanContent,
    word_count: wordCount,
    xp_awarded: xpAwarded,
  })

  // Update profile XP and streak
  await awardXP(user.id, 'LESSON_COMPLETE')

  return NextResponse.json(apiSuccess({ xpAwarded, wordCount }))
}
