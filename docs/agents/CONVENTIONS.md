# Code Conventions

Read this before writing code. These rules already hold across the codebase — match the existing style, do not invent your own.

---

## Stack baseline

- **Next.js 16** App Router. **Breaking from training data**: see notes below.
- **React 19**. Server Components default; opt into `'use client'` only when needed.
- **TypeScript 5** strict. No `any` unless explicitly justified.
- **Tailwind v4**. Tokens preferred over hardcoded hex (Codex Task D migrates legacy hex).
- **zod 4.3** for all runtime validation.
- **Supabase**: `@supabase/ssr` for server/client, service-role key for admin.

## Next.js 16 specifics (different from older docs)

- `cookies()` returns a Promise — `await cookies()`.
- `params` is a Promise — `await params`.
- `typedRoutes: true` — wrap unrecognized routes with `as Route` from `'next'`.
- The middleware convention is being renamed to `proxy` — Codex Task G handles the rename.

## API route handlers — the framework

**Always** wrap with `withApiHandler`. Always use the helpers; never re-implement auth, validation, rate-limiting, or error responses.

Pattern (mirror `src/app/api/srs/review/route.ts`):

```ts
import { NextResponse } from 'next/server'
import { apiSuccess } from '@/types/api'
import {
  withApiHandler,
  requireUser,
  parseJsonBody,
  assertUuid,
  enforceRateLimit,
  rateLimitKey,
  RATE_LIMITS,
  NotFound,
} from '@/lib/api'
import { someBodySchema } from '@/lib/validation'

export const POST = withApiHandler<{ id: string }>(async (request, { params }) => {
  const id = assertUuid(params.id, 'someEntityId')
  const { supabase, user } = await requireUser()
  enforceRateLimit(rateLimitKey({ userId: user.id, route: 'thing.action' }), RATE_LIMITS.write)
  const body = await parseJsonBody(request, someBodySchema)
  // ... domain logic ...
  return NextResponse.json(
    apiSuccess({
      /* result */
    }),
  )
})
```

Throwable error helpers from `@/lib/api`:

- `Unauthorized(msg?)`, `Forbidden(msg?)`, `NotFound(msg?)`, `BadRequest(msg)`, `ValidationFailed(msg)`, `RateLimited(retrySec)`, `Internal(msg?)`

Rate-limit presets: `RATE_LIMITS.read | .write | .heavy`.

## Adding a new zod contract

1. Create `src/lib/validation/<domain>.ts`
2. Export schemas + inferred types
3. Add `export * from './<domain>'` to `src/lib/validation/index.ts`
4. Consumers import from `@/lib/validation`

Only the Platform agent edits existing files in this folder. Other agents may add new files only if the task card explicitly assigns it.

## Data access — service layer

Place DB-access functions in `src/lib/services/<domain>.service.ts`. Pages and API routes call services; they never compose ad-hoc joins inline (legacy `dashboard/page.tsx`, `levels/[level]/page.tsx` are exceptions to be refactored).

Service pattern (`src/lib/services/verbs.service.ts` is the reference):

- Pure async functions
- Return typed shapes (no raw Supabase response leaks)
- Throw on `error` — let `withApiHandler` translate

## Page conventions (Server Components)

```ts
// src/app/(app)/something/page.tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: '... — FrancoPath' }

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // ...
}
```

For pages that change rarely, set `export const revalidate = 3600` (or higher).

## Tailwind / styling

- Prefer Tailwind utility classes. Inline `style={{ ... }}` only for design-token CSS variables (`var(--font-display)`, etc.).
- Brand color tokens (target state after Codex Task D):
  - `--color-brand` (was `#C24E2A`)
  - `--color-brand-dark` (was `#A03D20`)
  - `--color-bg` (was `#F7F4EF`)
  - `--color-fg` (was `#1E1B16`)
  - `--color-fg-muted` (was `#6B6460`)
  - `--color-fg-subtle` (was `#A09890`)
  - `--color-accent` (was `#D4970A`)
  - `--color-streak` (was `#E8612A`)
  - `--color-warning-soft` (was `#FBF1D5`)
  - `--color-warning-text` (was `#A07308`)
- Until Task D lands, mirror existing hex values rather than introducing new ones.

## Testing

- **Unit**: Vitest. Files in `src/tests/unit/` or co-located `*.test.ts`.
- **API integration**: Vitest with mocked Supabase (mock `@/lib/supabase/server` and `@/lib/supabase/admin`).
- **E2E**: Playwright in `e2e/`. Smoke flows only.
- Run `npm test` to verify.

## Commits

- Format: `<area>: <short verb-led summary>`
  - `verbs: add conjugation drill grader`
  - `vocab: import 363 A1/A2 entries via script`
  - `frontend: migrate brand colors to tokens`
- One logical change per commit; squash on merge to `main`.
- Co-author trailer is optional; if you add one, use the actual model name.

## Things that look wrong (and aren't)

- `process.env.NODE_ENV` direct access — fine in `next.config.ts` (build-time) but everywhere else use `env` from `@/lib/env`.
- `as Route` casts — required by Next 16 `typedRoutes` for routes the type-router can't statically resolve.
- Pre-existing `_unused`-prefixed parameters in 4 files — out of scope for cleanup, lint just warns.

## When in doubt

Read the closest existing file in the same dir and match its style. If you're about to introduce a new pattern, that's a flag — confirm in `STATUS.md` and pause.
