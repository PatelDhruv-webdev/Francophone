import { NextResponse } from 'next/server'
import { apiSuccess } from '@/types/api'
import {
  withApiHandler,
  requireUser,
  parseQuery,
  enforceRateLimit,
  rateLimitKey,
  RATE_LIMITS,
} from '@/lib/api'
import { listVerbsQuery } from '@/lib/validation'
import { listVerbs } from '@/lib/services/verbs.service'

export const GET = withApiHandler(async (request) => {
  const { user } = await requireUser()

  enforceRateLimit(rateLimitKey({ userId: user.id, route: 'verbs.list' }), RATE_LIMITS.read)

  const query = parseQuery(new URL(request.url).searchParams, listVerbsQuery)

  const verbs = await listVerbs({
    level: query.level,
    group: query.group,
    auxiliary: query.auxiliary,
    irregularOnly: query.irregular,
  })

  return NextResponse.json(apiSuccess({ verbs, count: verbs.length }))
})
