// Consistent API response envelope for all route handlers
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { data, error: null }
}

export function apiError(message: string, code: ApiErrorCode): ApiResponse<never> {
  return { data: null, error: { message, code } }
}
