import { NextResponse } from 'next/server'
import { apiSuccess } from '@/types/api'
import {
  withApiHandler,
  requireUser,
  enforceRateLimit,
  rateLimitKey,
  RATE_LIMITS,
  BadRequest,
  NotFound,
} from '@/lib/api'
import { verbIdSchema } from '@/lib/validation'
import { getVerbById } from '@/lib/services/verbs.service'

export const GET = withApiHandler<{ id: string }>(async (_request, { params }) => {
  const parsed = verbIdSchema.safeParse(params.id)
  if (!parsed.success) throw BadRequest(parsed.error.issues[0]?.message ?? 'invalid verb id')

  const { user } = await requireUser()

  enforceRateLimit(rateLimitKey({ userId: user.id, route: 'verbs.detail' }), RATE_LIMITS.read)

  const verb = await getVerbById(parsed.data)
  if (!verb) throw NotFound('Verb not found')

  return NextResponse.json(apiSuccess({ verb }))
})
