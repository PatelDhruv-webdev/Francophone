import { z, type ZodSchema } from 'zod'
import { BadRequest, ValidationFailed } from './errors'

export const uuidSchema = z.string().uuid()

// Validate a route param like the `[id]` segment. Throws ApiHttpError(400)
// with a clear message when the value isn't a UUID.
export function assertUuid(value: string, label = 'id'): string {
  const parsed = uuidSchema.safeParse(value)
  if (!parsed.success) throw BadRequest(`Invalid ${label}: must be a UUID`)
  return parsed.data
}

// Parse + validate a JSON body. Throws ApiHttpError(400) on bad JSON,
// ApiHttpError(422) on schema failure with a human-readable message.
export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw BadRequest('Invalid JSON body')
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    const summary = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    throw ValidationFailed(`Validation failed: ${summary}`, {
      issues: result.error.issues,
    })
  }
  return result.data
}

// Parse + validate URL search params (?foo=bar&baz=qux).
export function parseQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const obj = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(obj)
  if (!result.success) {
    const summary = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    throw BadRequest(`Invalid query: ${summary}`)
  }
  return result.data
}
