import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { logger } from '@/lib/observability/logger'
import { apiError } from '@/types/api'
import { ApiHttpError } from './errors'

export interface HandlerContext<TParams = Record<string, never>> {
  params: TParams
  requestId: string
}

type Handler<TParams> = (
  req: NextRequest,
  ctx: HandlerContext<TParams>,
) => Promise<NextResponse> | NextResponse

interface NextRouteContext<TParams> {
  params: Promise<TParams>
}

// Wrap a Next.js Route Handler with:
//   - request id (uuid) for log correlation
//   - centralized try/catch
//   - ApiHttpError → typed JSON response
//   - ZodError → 422 BAD_REQUEST
//   - everything else → 500 INTERNAL_ERROR (no stack leaked to client)
//   - structured logs on every error
//
// Usage:
//   export const POST = withApiHandler<{ id: string }>(async (req, { params, requestId }) => {
//     const id = assertUuid(params.id)
//     ...
//     return NextResponse.json(apiSuccess(result))
//   })
export function withApiHandler<TParams = Record<string, never>>(handler: Handler<TParams>) {
  return async (req: NextRequest, ctx: NextRouteContext<TParams>): Promise<NextResponse> => {
    const requestId = crypto.randomUUID()
    const startedAt = Date.now()
    const route = new URL(req.url).pathname
    const method = req.method

    try {
      const params = (await ctx.params) ?? ({} as TParams)
      const response = await handler(req, { params, requestId })
      response.headers.set('x-request-id', requestId)
      logger.info({
        requestId,
        route,
        method,
        status: response.status,
        durationMs: Date.now() - startedAt,
      })
      return response
    } catch (err) {
      return handleError(err, { requestId, route, method, startedAt })
    }
  }
}

interface ErrorContext {
  requestId: string
  route: string
  method: string
  startedAt: number
}

function handleError(err: unknown, ctx: ErrorContext): NextResponse {
  const durationMs = Date.now() - ctx.startedAt

  if (err instanceof ApiHttpError) {
    logger.warn({
      requestId: ctx.requestId,
      route: ctx.route,
      method: ctx.method,
      status: err.status,
      code: err.code,
      message: err.message,
      durationMs,
      ...err.extra,
    })
    const headers: Record<string, string> = { 'x-request-id': ctx.requestId }
    if (err.code === 'RATE_LIMITED' && typeof err.extra?.['retryAfterSec'] === 'number') {
      headers['retry-after'] = String(err.extra['retryAfterSec'])
    }
    return NextResponse.json(apiError(err.message, err.code), { status: err.status, headers })
  }

  if (err instanceof ZodError) {
    logger.warn({
      requestId: ctx.requestId,
      route: ctx.route,
      method: ctx.method,
      status: 422,
      code: 'BAD_REQUEST',
      message: 'validation failed',
      durationMs,
      issues: err.issues,
    })
    return NextResponse.json(apiError('Validation failed', 'BAD_REQUEST'), {
      status: 422,
      headers: { 'x-request-id': ctx.requestId },
    })
  }

  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : undefined
  logger.error({
    requestId: ctx.requestId,
    route: ctx.route,
    method: ctx.method,
    status: 500,
    code: 'INTERNAL_ERROR',
    message,
    stack,
    durationMs,
  })
  // Never leak internal error details to the client.
  return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), {
    status: 500,
    headers: { 'x-request-id': ctx.requestId },
  })
}
