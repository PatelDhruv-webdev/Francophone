// In-memory token-bucket rate limiter. Single-instance only — replace with
// Upstash Redis / Vercel KV when scaling beyond one Node process.

import { RateLimited } from './errors'

interface Bucket {
  tokens: number
  updatedAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

export interface RateLimitConfig {
  capacity: number // burst size
  refillPerMinute: number // sustained rate
}

// Sensible defaults per endpoint shape.
export const RATE_LIMITS = {
  // Reads (cheap, idempotent): generous.
  read: { capacity: 60, refillPerMinute: 120 },
  // Writes (XP, SRS review, exercise submit): moderate.
  write: { capacity: 30, refillPerMinute: 60 },
  // Heavy writes (writing submissions, AI calls): strict.
  heavy: { capacity: 6, refillPerMinute: 12 },
} as const satisfies Record<string, RateLimitConfig>

interface CheckResult {
  ok: boolean
  retryAfterSec: number
  remaining: number
}

export function checkRateLimit(key: string, cfg: RateLimitConfig): CheckResult {
  const now = Date.now()
  const refillPerMs = cfg.refillPerMinute / 60_000
  const existing = buckets.get(key)

  // Crude eviction so we don't grow unbounded — drop oldest when full.
  if (!existing && buckets.size >= MAX_BUCKETS) {
    const firstKey = buckets.keys().next().value
    if (firstKey) buckets.delete(firstKey)
  }

  const tokens = existing
    ? Math.min(cfg.capacity, existing.tokens + (now - existing.updatedAt) * refillPerMs)
    : cfg.capacity

  if (tokens < 1) {
    const retry = Math.ceil((1 - tokens) / refillPerMs / 1000)
    buckets.set(key, { tokens, updatedAt: now })
    return { ok: false, retryAfterSec: Math.max(1, retry), remaining: 0 }
  }

  buckets.set(key, { tokens: tokens - 1, updatedAt: now })
  return { ok: true, retryAfterSec: 0, remaining: Math.floor(tokens - 1) }
}

// Throw-style helper for use inside withApiHandler routes.
export function enforceRateLimit(key: string, cfg: RateLimitConfig): void {
  const result = checkRateLimit(key, cfg)
  if (!result.ok) throw RateLimited(result.retryAfterSec)
}

// Build a stable key from user id + route id. IP fallback for anonymous calls.
export function rateLimitKey(parts: { userId?: string; ip?: string; route: string }): string {
  const subject = parts.userId ?? parts.ip ?? 'anon'
  return `${parts.route}:${subject}`
}
