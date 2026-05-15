# Agent Starter — Read This First

You are joining FrancoPath, a multi-agent codebase. Before you touch any file, read **these documents in order**:

1. **`docs/agents/STARTER.md`** ← this file
2. **`docs/agents/CHARTERS.md`** — your role, what you own, what you must NOT touch
3. **`docs/agents/CONVENTIONS.md`** — code-style, framework patterns, how to use the API framework
4. **`docs/agents/CODING-PLAN.md`** — the full ordered task list across all phases
5. **`docs/agents/TASKS.md`** — your specific task card (find the letter the spawn prompt gives you)
6. **`docs/agents/STATUS.md`** — current daily log (append your row at end of session)

Then read your specific task card (the message that spawned you).

---

## What is FrancoPath?

A French-learning web app — Next.js 16 (App Router) + React 19 + Supabase (Postgres, RLS, Auth) + Tailwind v4 + zod. It teaches A1 → C1 with vocabulary, conjugation, grammar, reading, listening, writing, SRS, gamification.

The codebase has a **Platform foundation already in place**: env validation, structured logger, API handler HOF, rate limiter, error classes, zod contracts. You consume these — you do not rewrite them.

---

## Universal rules (every agent obeys)

1. **Stay in your owned dirs.** If your task needs a change outside, leave a note in `STATUS.md` and stop — don't reach across.
2. **One branch per agent.** `agents/<role>` (e.g. `agents/content-vocab`). Never push to `main`. Never force-push.
3. **Never skip hooks.** No `--no-verify`. If a pre-commit hook fails, fix the cause.
4. **Contracts are sacred.** Schemas in `src/lib/validation/*` and types in `src/types/database.generated.ts` are interfaces. **Only the Platform agent edits them.** Everyone else imports from them.
5. **Migrations are Platform-only.** If you need a schema change, leave a request in `STATUS.md` and stop.
6. **Run before pushing:** `npm run type-check && npm run lint && npm run build`. All three must pass.
7. **Update `STATUS.md`** at end of session with one line under today's date.
8. **Small commits.** One commit per logical change. Commit message format: `<area>: <short verb-led summary>` (e.g. `verbs: add conjugation drill API`).

---

## Working environment

- **Node**: v22 via nvm, package manager: `npm` (lockfile is `package-lock.json`)
- **Run scripts**: `npm run dev` / `build` / `type-check` / `lint` / `test`
- **No `pnpm`, no `yarn`** — `package-lock.json` is the source of truth
- **Pre-commit hook** runs lint-staged (eslint --fix + prettier)
- **Local Supabase**: env vars come from a `.env.local` (see `.env.example`). The Platform agent's env validator skips the throw during `next build`, so build works without env. Runtime requires real env.

---

## Hard "do not touch" list (every non-Platform agent)

- `next.config.ts`
- `src/middleware.ts` (or `src/proxy.ts` after rename)
- `src/lib/env.ts`
- `src/lib/api/**`
- `src/lib/observability/**`
- `src/lib/supabase/**`
- `src/lib/validation/**` — you can **add** new files here ONLY if your charter explicitly assigns the contract; you may **never** modify existing files
- `supabase/migrations/**`
- `src/types/database.generated.ts`
- `package.json` "dependencies" — Platform reviews any new dep request via STATUS.md (you can add npm scripts)

---

## Acceptance checklist (run before declaring done)

```bash
npm run type-check    # 0 errors
npm run lint          # 0 errors (pre-existing warnings OK)
npm run build         # success
```

If you added/changed UI: also start dev (`npm run dev`) and visually confirm the changed page renders.

---

## Asking for help

If blocked, append to `STATUS.md` under your row:

> **Blocked by:** \<one sentence describing the blocker\>

Then stop. Do not improvise across boundaries. The human orchestrator unblocks you next sync.

---

## Re-entering after a session loss

If your session is killed and a new agent boots in your place, the new agent reads this file + the charter + your last `STATUS.md` row, then continues from where you left off.
