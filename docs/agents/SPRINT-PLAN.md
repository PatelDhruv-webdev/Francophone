# Sprint Plan

Effort tags: 🟢 LOW (Codex) · 🟡 MED (Claude) · 🔴 HIGH (Claude)

## Sprint 1 — Platform Foundation (Claude only, sequential)

| #    | Task                                 | Effort | Owner  | Status      |
| ---- | ------------------------------------ | ------ | ------ | ----------- |
| 1.1  | Migration: extend vocabulary columns | 🟢     | Codex  | pending     |
| 1.2  | Migration: create verbs table        | 🟢     | Codex  | pending     |
| 1.3  | Migration: extend profiles           | 🟢     | Codex  | pending     |
| 1.4  | Type generation script               | 🟢     | Codex  | pending     |
| 1.5  | Env validation with zod              | 🔴     | Claude | in_progress |
| 1.6  | withApiHandler HOF                   | 🔴     | Claude | pending     |
| 1.7  | CSP tightening                       | 🔴     | Claude | pending     |
| 1.8  | Rate limiter (token bucket)          | 🔴     | Claude | pending     |
| 1.9  | UUID/zod validation helpers          | 🟡     | Claude | pending     |
| 1.10 | DOMPurify sanitizer for writing      | 🟢     | Codex  | pending     |
| 1.11 | Wrap all 7 routes                    | 🟡     | Claude | pending     |
| 1.12 | Logger + observability               | 🟡     | Claude | pending     |
| 1.13 | Charters + Status template           | 🔴     | Claude | done        |

## Sprint 2 — Content Pack Ingestion

| #   | Task                                           | Effort | Owner  |
| --- | ---------------------------------------------- | ------ | ------ |
| 2.1 | Copy data pack to `data/source/`               | 🟢     | Codex  |
| 2.2 | `scripts/import-data-pack.ts` (vocab)          | 🟡     | Claude |
| 2.3 | Same script — verbs                            | 🟢     | Codex  |
| 2.4 | Seed `grammar_topics` from md                  | 🟡     | Claude |
| 2.5 | Hint dictionary `data/source/error-hints.json` | 🔴     | Claude |
| 2.6 | Wire new sources into `scripts/seed.ts`        | 🟢     | Codex  |

## Sprint 3 — Smart Grader + Verb Drill

### Track A — Domain (Claude)

3.A1 Discriminated grader map · 3.A2 Edge-case feedback engine · 3.A3 Conjugation grader · 3.A4 Auxiliary trainer · 3.A5 XP RPC

### Track B — Frontend (Codex)

3.B1 Design tokens · 3.B2 ConjugationTable · 3.B3 VerbDrill · 3.B4–6 Verb pages · 3.B7 Hint chip

## Sprint 4 — AI Bundle (Claude-heavy)

4.1 Anthropic client + caching · 4.2 System prompts · 4.3 Writing feedback · 4.4 Smart hints · 4.5 Explain modal API · 4.6–8 Frontend panels

## Sprint 5 — Engagement

Hearts · Streak freeze · Daily challenge · Achievement expansion

## Sprint 6 — Reading + Click-to-Translate

Wiktionary client · Click-any-word · In-app reader · Project Gutenberg ingest · False-friends chip

## Sprint 7 — A2 Content + Bulk Imports

A2 vocab/grammar/reading/listening/writing · Lefff bulk · (optional) Lexique 3 bulk

## Sprint 8 — Quality + Cleanup

API tests · Playwright smoke · A11y · Discriminated-union casts · Service layer · N+1 fix · CASCADE FKs · Dead code

## Sprint 9+ — Future

Marie tutor · Roleplay · Leagues · Friends · B1/B2/C1 · Forvo audio · LanguageTool · Admin panel
