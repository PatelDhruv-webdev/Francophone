import type { ApiErrorCode } from '@/types/api'

// Throw inside a withApiHandler-wrapped route to short-circuit with a
// structured error response. The handler converts it to JSON.
export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiHttpError'
  }
}

export const Unauthorized = (message = 'Sign in required') =>
  new ApiHttpError(401, 'UNAUTHORIZED', message)

export const Forbidden = (message = 'Forbidden') => new ApiHttpError(403, 'FORBIDDEN', message)

export const NotFound = (message = 'Not found') => new ApiHttpError(404, 'NOT_FOUND', message)

export const BadRequest = (message: string) => new ApiHttpError(400, 'BAD_REQUEST', message)

export const ValidationFailed = (message: string, extra?: Record<string, unknown>) =>
  new ApiHttpError(422, 'BAD_REQUEST', message, extra)

export const RateLimited = (retryAfterSec: number) =>
  new ApiHttpError(429, 'RATE_LIMITED', 'Too many requests', { retryAfterSec })

export const Internal = (message = 'Internal server error') =>
  new ApiHttpError(500, 'INTERNAL_ERROR', message)
