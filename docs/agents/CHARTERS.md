# FrancoPath — Agent Charters

This file is the **first thing every agent reads**. It defines what each agent owns, what it must NEVER touch, and what "done" looks like.

> **Tool-agnostic.** A charter does not say "you are Claude" or "you are Codex." Each agent is identified by **role** and operates on its **own git branch**. Tooling is documented in `STATUS.md`.

## Universal rules (every agent obeys)

> **Reading order for new agents:** `STARTER.md` → this file → `CONVENTIONS.md` → your task card in `TASKS.md`.

1. **Read this file**, then your section, then read your assigned task card in `TASKS.md`.
2. **Stay in your owned dirs.** Do not edit files outside your scope; if you need a change there, leave a comment in `STATUS.md` blocked-by line.
3. **One PR per task.** Branch is `agents/<role>`. Squash-merge into `main` after review.
4. **Contracts are sacred.** `src/lib/validation/*` and DB types in `src/types/database.generated.ts` are interfaces. The Platform agent is the only one allowed to modify them; everyone else consumes them.
5. **Never skip hooks.** No `--no-verify`, no `--no-gpg-sign`. If a hook fails, fix the cause.
6. **Run before pushing:** `pnpm type-check && pnpm lint`.
7. **Update `STATUS.md`** at end of session with one line under your row.
8. **Next.js 16 has breaking changes** from training data. If you write Next.js code, read `node_modules/next/dist/docs/` for the relevant feature first. Existing repo conventions: `await cookies()`, `await params`, `typedRoutes: true`, `Route` type.

---

## 🟦 Platform Agent

**Mission:** Foundation — DB schema, security, env validation, API handler framework, observability. Everything else depends on this. Goes first; goes alone.

### Owns

- `supabase/migrations/**`
- `src/lib/env.ts`
- `src/lib/api/**` (handler HOF, rate limiter, validation helpers, errors)
- `src/lib/observability/**`
- `src/lib/supabase/**`
- `src/middleware.ts`
- `next.config.ts`
- `src/lib/validation/**` (zod contracts — write the schemas, others import)
- `src/types/database.generated.ts` (regenerate after every migration)
- `.env.example`
- `scripts/generate-types.sh`

### Never touches

- `src/components/**` (Frontend agent)
- `src/app/(app)/**/page.tsx` (Frontend agent)
- `src/lib/services/**` (Domain agent — except service skeletons in Sprint 1)
- `src/lib/grading/**`, `src/lib/srs/**`, `src/lib/xp/**` (Domain agent)
- `src/lib/ai/**` (AI agent)
- `data/**` (Content agent — except `data/source/` which is read-only after import)

### Done means

- `pnpm type-check && pnpm lint` clean.
- Every API route is wrapped in `withApiHandler` + rate limit + zod validation.
- Env validation throws clearly when missing required vars.
- CSP no longer contains `unsafe-eval`.
- `STATUS.md` updated.

### Sprint 1 tasks (HIGH+MED only — Claude does these)

1. `src/lib/env.ts` with zod validation; refactor 4 supabase files
2. `src/lib/api/with-handler.ts` HOF
3. `src/lib/api/rate-limit.ts` token bucket
4. `src/lib/api/validate.ts` UUID + body + query helpers
5. `src/lib/api/errors.ts` `ApiHttpError` class
6. `src/lib/api/auth.ts` `requireUser()` helper
7. `src/lib/observability/logger.ts` structured logger
8. `next.config.ts` CSP tightening
9. `src/lib/validation/{exercises,srs,writing,reading,listening,stats}.ts` zod contracts
10. Wrap all 7 routes in `src/app/api/`

### Sprint 1 tasks (LOW — Codex does these in parallel after the HIGH ones land)

- `supabase/migrations/<ts>_extend_vocabulary.sql` (add `en_alt`, `plural`, `feminine`, `feminine_plural`, `masculine_plural`, `example_en`, `notes`)
- `supabase/migrations/<ts>_create_verbs.sql`
- `supabase/migrations/<ts>_extend_profiles.sql` (`dialect_preference`, `spelling_preference`, `hearts`, `hearts_refilled_at`)
- `.env.example` with all keys
- `src/lib/sanitize.ts` using DOMPurify; swap into `writing/[id]/submit`

---

## 🟩 Content Agent

**Mission:** Land the 363 vocab + 35 verbs + 17 grammar topics from `data/source/`. Build the importer, dedupe against existing A1, populate `grammar_topics`. Later: A2/B1/B2/C1 content, bulk Lexique/Lefff imports.

### Owns

- `data/**` (all level folders + source pack)
- `scripts/import-data-pack.ts`
- `scripts/import-lexique3.py`
- `scripts/import-verbiste.js`
- `scripts/seed.ts` (extend, don't break)

### Never touches

- Anything in `src/lib/api/**`, `src/lib/services/**`
- Migrations (Platform agent only — request via STATUS.md)
- DB schema (Platform agent only)

### Done means

- `pnpm seed` (or equivalent) populates DB with 363 vocab + 35 verbs.
- Existing A1 data is not duplicated.
- `grammar_topics` has rows for the 17 sections of `grammar_edge_cases.md`.

---

## 🟧 Frontend Agent

**Mission:** Pages + components + design system. Consumes API contracts; never writes server code.

### Owns

- `src/app/(app)/**/page.tsx` (and nested layouts/route segments)
- `src/app/(auth)/**`
- `src/components/**`
- `src/store/**` (Zustand stores)
- `src/styles/**`, Tailwind theme config
- Design tokens

### Never touches

- `src/app/api/**` (Platform agent)
- `src/lib/**` (other agents)
- Any migration or DB code
- `next.config.ts` (Platform agent)

### Done means

- `pnpm type-check && pnpm lint` clean.
- New pages render against API contracts in `src/lib/validation/`.
- Lighthouse a11y ≥ 95 on changed pages.
- No hardcoded brand colors — use design tokens.

---

## Coordination

### Sequence (Sprint 1)

1. **Platform** runs alone — Sprint 1 HIGH+MED tasks. ~1–2 days.
2. After Platform's PR merges, **Content** + **Frontend** start in parallel.

### Daily ritual (you, the human, ~10 min)

1. Pull latest `main`.
2. Open `STATUS.md`. Read each agent's last line.
3. Unblock anyone marked `blocked by`.
4. Squash-merge any green PR.
5. Tell each agent: "rebase on main and continue with task X."

### Conflict avoidance

- Each agent's branch lives long. They rebase on `main` at start of every session.
- If two agents need to touch the same file: one waits, the other goes. Coordinate via `STATUS.md`.
- Migrations are serialized (Platform only).

### Re-spawning an agent

If an agent session is lost, paste this into the new session:

> Read `docs/agents/CHARTERS.md`. You are the **<role>** agent. Confirm what you own and what you must NEVER touch. Read your latest row in `docs/agents/STATUS.md` and continue from where it left off.
