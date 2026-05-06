import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardXP } from '@/lib/xp/awards'
import { apiError, apiSuccess } from '@/types/api'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auth — must be signed in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()

  // Check if already completed
  const { data: existing } = await admin
    .from('user_reading_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('resource_id', id)
    .single()

  if (existing) {
    return NextResponse.json(apiSuccess({ alreadyCompleted: true, xpAwarded: 0 }))
  }

  // Record completion
  await admin.from('user_reading_progress').insert({
    user_id: user.id,
    resource_id: id,
    xp_awarded: 10,
  })

  // Update profile XP and streak
  await awardXP(user.id, 'LESSON_COMPLETE')

  return NextResponse.json(apiSuccess({ alreadyCompleted: false, xpAwarded: 10 }))
}
