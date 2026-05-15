// Validated environment access. Import `env` (or `serverEnv`) instead of `process.env`.
// Throws on module load in production if required vars are missing or malformed.

import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

// CI exports unset secrets as empty strings; treat those as "unset" so Zod's
// .optional() / partial() fallback behaves correctly during the build phase.
const rawEnv = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === '' ? undefined : v]),
)

const parsed = envSchema.safeParse(rawEnv)

// `next build` runs all module top-levels to collect page data — it does NOT
// have a runtime .env. Skip the strict throw in that phase; runtime requests
// (production server) still get full validation.
const isBuildPhase = process.env['NEXT_PHASE'] === 'phase-production-build'

if (!parsed.success) {
  const issues = parsed.error.flatten().fieldErrors
  console.error('[env] invalid environment variables:', issues)
  if (process.env['NODE_ENV'] === 'production' && !isBuildPhase) {
    throw new Error('Invalid environment configuration. See logs for missing keys.')
  }
}

export const env: Env = parsed.success ? parsed.data : (envSchema.partial().parse(rawEnv) as Env)

// Server-only: throws if SUPABASE_SERVICE_ROLE_KEY is missing.
// Use only in admin client / scripts. Never import from a Client Component path.
export function serverEnv(): Env & { SUPABASE_SERVICE_ROLE_KEY: string } {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for server-only operations (admin client, grading, scripts).',
    )
  }
  return env as Env & { SUPABASE_SERVICE_ROLE_KEY: string }
}
