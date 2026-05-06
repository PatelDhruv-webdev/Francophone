import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/types/api'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })
  }

  // Parse optional limit param — default 20, max 50
  const { searchParams } = new URL(request.url)
  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10)
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(1, rawLimit), 50)

  const today = new Date().toISOString().split('T')[0]

  const { data: cards, error } = await supabase
    .from('srs_cards')
    .select('*')
    .eq('user_id', user.id)
    .lte('due_date', today)
    .order('due_date')
    .limit(limit)

  if (error) {
    return NextResponse.json(apiError('Failed to fetch SRS cards', 'INTERNAL_ERROR'), {
      status: 500,
    })
  }

  return NextResponse.json(apiSuccess({ cards: cards ?? [], count: (cards ?? []).length }))
}
