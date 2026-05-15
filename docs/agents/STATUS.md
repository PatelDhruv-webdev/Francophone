# Agent Status

Update your row at the END of every session.

## Active assignments

| Agent    | Tool        | Branch          | Current task                           | Blocked by |
| -------- | ----------- | --------------- | -------------------------------------- | ---------- |
| platform | Claude Code | agents/platform | Sprint 1: env + handler + rate limit   | —          |
| content  | Codex       | agents/content  | Sprint 2: data-pack importer (waiting) | platform   |
| frontend | Codex       | agents/frontend | Sprint 3: design tokens (waiting)      | platform   |

## Daily log

### 2026-05-09

- platform: started Sprint 1; copied data pack to `data/source/`; charters + status written; building env validation next.
- platform: Sprint 1 (HIGH+MED) DONE — env validator, withApiHandler, errors, validate, auth, rate-limit, logger, CSP tightened, all 7 routes wrapped. Typecheck + lint clean (0 errors). Codex unblocked for LOW tasks 1.1–1.4, 1.10.
- platform: Sprint 1 LOW + Sprint 2/3 vertical slice DONE — migrations 005/006/007 (verbs, vocab columns, profile prefs), DOMPurify sanitize, scripts/import-verbs.ts, verbs.service + zod, /api/verbs + /api/verbs/[id], pages /verbs + /verbs/[id], sidebar entry. Build passes ✓. Env validation now skips throw during `next build` phase.
- content: Task A DONE — added `scripts/import-vocab.ts` + `npm run import:vocab`; processes 363 vocab entries with `(french, level_code)` upsert, reports inserted/updated counts. `npm run type-check && npm run lint && npm run build` passed.

<!-- Append one line per agent per session below -->

### 2026-05-10

- content: Task B DONE — added grammar edge-case seeder and npm script; `npm run type-check && npm run lint && npm run build` passes with existing lint/build warnings only.
- content: Task C DONE — added `data/source/error-hints.json` with 9 section-16 hints; JSON validation and `npm run type-check && npm run lint && npm run build` pass with existing warnings only.
- frontend: Task D DONE — added 10 semantic brand aliases (`--color-brand`, `--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-accent`, `--color-streak`, `--color-warning-soft`, `--color-warning-text`, `--color-brand-dark`) to `globals.css` `@theme inline`; codemod replaced 483 hex literals across 53 files in `src/components/**` + `src/app/**`; `npm run type-check && npm run lint && npm run build` clean; landing page renders token classes. Note: `/dashboard`, `/verbs`, `/levels` return 500 in local dev only because no `.env.local` is configured — unrelated to this migration.
