# FrancoPath — Coding Plan

This is the complete, ordered task list to take FrancoPath from current state to a fully edge-case-hardened, feature-complete product.

**Reading order:** STARTER.md → CHARTERS.md → CONVENTIONS.md → this file.

**Status legend:** ⬜ pending · 🟡 in-progress · ✅ done · 🚫 blocked

**Effort:** 🟢 LOW (Codex) · 🟡 MED (Claude/Codex) · 🔴 HIGH (Claude)

**Owner:** **C**laude · **X** Codex · **?** unclaimed

---

## Phase 0 — Foundation (DONE)

| #   | Task                                   | Files                                                           | Effort | Owner | Status |
| --- | -------------------------------------- | --------------------------------------------------------------- | ------ | ----- | ------ |
| 0.1 | Env validator (zod)                    | `src/lib/env.ts` + 4 supabase clients                           | 🔴     | C     | ✅     |
| 0.2 | API handler framework                  | `src/lib/api/{errors,validate,auth,rate-limit,with-handler}.ts` | 🔴     | C     | ✅     |
| 0.3 | Structured logger                      | `src/lib/observability/logger.ts`                               | 🟡     | C     | ✅     |
| 0.4 | Validation contracts skeleton          | `src/lib/validation/`                                           | 🟡     | C     | ✅     |
| 0.5 | DOMPurify sanitizer                    | `src/lib/sanitize.ts`                                           | 🟢     | C     | ✅     |
| 0.6 | CSP tightening                         | `next.config.ts`                                                | 🔴     | C     | ✅     |
| 0.7 | Agent charters + docs                  | `docs/agents/`                                                  | 🔴     | C     | ✅     |
| 0.8 | Verbs migration + import + API + pages | many                                                            | 🟡     | C     | ✅     |
| 0.9 | Design tokens migration                | UI files                                                        | 🟡     | X     | ✅     |

---

## Phase 1 — Content Pipeline (parallel-safe, spawn now)

| #   | Task                               | Files                                             | Effort | Owner | Depends  | Status |
| --- | ---------------------------------- | ------------------------------------------------- | ------ | ----- | -------- | ------ |
| 1.1 | Vocabulary importer (Task A)       | `scripts/import-vocab.ts` + `package.json` script | 🟢     | X     | 0.x done | ⬜     |
| 1.2 | Grammar topics seeder (Task B)     | `scripts/seed-grammar-edge-cases.ts`              | 🟡     | X     | —        | ⬜     |
| 1.3 | Hint dictionary JSON (Task C)      | `data/source/error-hints.json`                    | 🟢     | X     | —        | ⬜     |
| 1.4 | Mobile nav `Verbes` entry (Task F) | `src/components/layout/MobileNav.tsx`             | 🟢     | X     | —        | ⬜     |
| 1.5 | middleware → proxy rename (Task G) | rename file                                       | 🟢     | X     | —        | ⬜     |
| 1.6 | Profile preferences UI (Task E)    | `/profile`, new API route                         | 🟡     | X     | —        | ⬜     |
| 1.7 | API integration tests (Task H)     | `src/tests/api/**`                                | 🟡     | X     | —        | ⬜     |
| 1.8 | Dead code removal (Task I)         | various                                           | 🟢     | X     | —        | ⬜     |

**Goal:** All content from the data pack is in the DB; UI nav is complete; dead code gone; tests cover the API surface.

---

## Phase 2 — Grader & Conjugation Edge Cases (HIGH — Claude)

The single most user-visible quality lever. Implements every rule from `data/source/grammar_edge_cases.md` into the grader so wrong-answer feedback is targeted.

| #   | Task                                                  | Files                                                                                                                                                                  | Effort | Owner | Depends  | Status |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | -------- | ------ |
| 2.1 | Text normalizer module                                | `src/lib/grading/normalize.ts` (extend existing) — apostrophe (`'`/`’`/`'`), curly quotes, ligature (`œ`/`oe`), NFC unicode, trim, accent-tolerance toggle             | 🟡     | C     | —        | ⬜     |
| 2.2 | Multi-answer acceptance                               | extend `gradeTypeAnswer`, `gradeFillInBlank` to accept `string \| string[]` correctly                                                                                  | 🟡     | C     | 2.1      | ⬜     |
| 2.3 | Reform-1990 alt spelling matcher                      | new `src/lib/grading/spelling-variants.ts` — accept `connaitre`/`connaître`, `oignon`/`ognon`, etc. honoring `profiles.spelling_preference`                            | 🔴     | C     | 2.1      | ⬜     |
| 2.4 | Conjugation grader                                    | new `src/lib/grading/conjugation.ts` — given (verb_id, tense, person, answer) look up `verbs.conjugations`, normalize, match. Tolerates ligature & apostrophe variants | 🔴     | C     | 2.1, 0.8 | ⬜     |
| 2.5 | Auxiliary disambiguation                              | new `src/lib/grading/auxiliary.ts` — for dual-aux verbs (sortir/monter/…), grade based on transitivity in prompt context                                               | 🔴     | C     | 2.4      | ⬜     |
| 2.6 | Past participle agreement validator                   | new `src/lib/grading/agreement.ts` — three rules from grammar md section 5                                                                                             | 🔴     | C     | 2.4      | ⬜     |
| 2.7 | Hint dictionary loader + matcher                      | new `src/lib/grading/hints.ts` — load `data/source/error-hints.json`, regex-match user errors → return French + English hint string                                    | 🟡     | C     | 1.3      | ⬜     |
| 2.8 | Grader unit tests                                     | `src/tests/unit/grading/*.test.ts` per case                                                                                                                            | 🟡     | C     | 2.x      | ⬜     |
| 2.9 | Wire hints into `/api/exercises/[id]/submit` response | add `hint?: { fr, en }` field; update zod contract                                                                                                                     | 🟡     | C     | 2.7      | ⬜     |

**Acceptance:** User submits `je suis 25 ans` → grader returns `correct=false` + `hint.fr="Le français utilise « avoir » : j'ai 25 ans."`. Test suite green.

---

## Phase 3 — XP / Streak / Hearts Atomicity (HIGH — Claude)

Race-free, timezone-safe gamification core. Currently `awardXP` is a multi-statement JS function — can drop updates under load.

| #   | Task                                           | Files                                                                                                                                                                          | Effort | Owner | Depends | Status |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----- | ------- | ------ |
| 3.1 | Migration: `award_xp` Postgres function        | new `supabase/migrations/...award_xp_rpc.sql` — single transaction: read profile, compute streak, update xp+streak+last_active_at, upsert daily_activity row, return new state | 🔴     | C     | —       | ⬜     |
| 3.2 | Refactor `src/lib/xp/awards.ts` to call RPC    | switch to `supabase.rpc('award_xp', { p_user_id, p_action })`                                                                                                                  | 🟡     | C     | 3.1     | ⬜     |
| 3.3 | Streak freeze: column + redeem function        | migration adds `profiles.streak_freezes int default 0`, `award_xp` consumes one on missed-day                                                                                  | 🔴     | C     | 3.1     | ⬜     |
| 3.4 | Hearts refill timer                            | migration adds Postgres function `refill_hearts(user_id, now)` called by middleware on every request OR client polling; one heart per 4 hours, cap 5                           | 🟡     | C     | —       | ⬜     |
| 3.5 | Hearts deduction on wrong answer               | hook into `/api/exercises/[id]/submit` failure path; throws `Forbidden` when hearts=0                                                                                          | 🟡     | C     | 3.4     | ⬜     |
| 3.6 | Timezone-safe date math                        | `src/lib/time/day-bucket.ts` — single util converting `Date → 'YYYY-MM-DD' UTC`; replace all ad-hoc usages                                                                     | 🟡     | C     | —       | ⬜     |
| 3.7 | Tests for streak edges (DST, midnight, freeze) | `src/tests/unit/xp/*.test.ts`                                                                                                                                                  | 🟡     | C     | 3.x     | ⬜     |

**Acceptance:** Two parallel calls to `award_xp` for same user → both reflected in final xp count (atomicity); a user missing exactly one day with one streak freeze keeps their streak; hearts refill exactly every 4 hours capped at 5.

---

## Phase 4 — SRS Robustness (MED — Claude)

| #   | Task                     | Files                                                                                           | Effort | Owner | Depends | Status |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------- | ------ | ----- | ------- | ------ |
| 4.1 | Quality=0 reset path     | `src/lib/srs/algorithm.ts` — verify SM-2 behavior, adjust if ease_factor floor < 1.3            | 🟢     | C     | —       | ⬜     |
| 4.2 | Item-deref guard         | extend due endpoint to LEFT JOIN vocab/verbs; skip cards whose item no longer exists            | 🟡     | C     | —       | ⬜     |
| 4.3 | Orphan cleanup migration | `...delete_orphan_srs.sql` — periodic function                                                  | 🟢     | C     | 4.2     | ⬜     |
| 4.4 | Bulk-review consistency  | track session id in `srs_cards.last_session_id`; prevent re-review of same card in same session | 🟡     | C     | —       | ⬜     |
| 4.5 | Tests                    | `src/tests/unit/srs/*.test.ts`                                                                  | 🟡     | C     | 4.x     | ⬜     |

---

## Phase 5 — Auth & Session Edge Cases (MED — Claude)

| #   | Task                                        | Files                                                                                    | Effort | Owner | Depends | Status |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------------- | ------ | ----- | ------- | ------ |
| 5.1 | Email-already-registered surfacing          | signup page — map Supabase error codes to user-friendly strings                          | 🟢     | C     | —       | ⬜     |
| 5.2 | Email verification gate                     | middleware — block protected routes if `user.email_confirmed_at` null; show resend CTA   | 🟡     | C     | —       | ⬜     |
| 5.3 | Session refresh failure → friendly redirect | `src/lib/supabase/middleware.ts` — on getUser error, redirect to `/login?reason=expired` | 🟡     | C     | —       | ⬜     |
| 5.4 | Password reset error states                 | reset & update-password pages — handle expired/used links                                | 🟢     | C     | —       | ⬜     |
| 5.5 | Login throttling                            | rate-limit `auth.signInWithPassword` calls keyed on email                                | 🟡     | C     | 0.2     | ⬜     |

---

## Phase 6 — Content Validation (MED — Claude)

| #   | Task                       | Files                                                                                                 | Effort | Owner | Depends  | Status |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------- | ------ | ----- | -------- | ------ |
| 6.1 | Vocab JSON validator       | `src/lib/validation/content/vocabulary.ts` (zod)                                                      | 🟡     | C     | —        | ⬜     |
| 6.2 | Verb JSON validator        | `src/lib/validation/content/verbs.ts` (zod) — full conjugation completeness check                     | 🟡     | C     | —        | ⬜     |
| 6.3 | Grammar markdown validator | `src/lib/validation/content/grammar.ts` — expected sections                                           | 🟡     | C     | —        | ⬜     |
| 6.4 | Pre-import validation step | extend `scripts/import-verbs.ts` and `scripts/import-vocab.ts` to run validators first; abort on fail | 🟢     | C     | 6.1, 6.2 | ⬜     |
| 6.5 | Duplicate detection        | importers log duplicates by `french+level_code` / `id` before upsert                                  | 🟢     | C     | —        | ⬜     |

---

## Phase 7 — Verb Drill (HIGH — Claude, the marquee feature)

Interactive drill consuming the verbs from Phase 0/Phase 1.

| #   | Task                     | Files                                                                                                                     | Effort | Owner | Depends       | Status |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | ------------- | ------ |
| 7.1 | Drill domain service     | `src/lib/services/drill.service.ts` — pick next prompt (tense+person), sample distractors                                 | 🔴     | C     | 2.4           | ⬜     |
| 7.2 | Drill grader             | `src/lib/grading/drill.ts` — uses conjugation grader + hint dictionary                                                    | 🔴     | C     | 2.4, 2.7      | ⬜     |
| 7.3 | Drill session table      | migration `...create_drill_sessions.sql` — track session id, prompts asked, score                                         | 🟡     | C     | —             | ⬜     |
| 7.4 | API: start/answer/finish | `src/app/api/verbs/[id]/drill/{start,answer,finish}/route.ts`                                                             | 🟡     | C     | 7.1, 7.2, 7.3 | ⬜     |
| 7.5 | Drill UI state machine   | `src/app/(app)/verbs/[id]/drill/page.tsx` + `src/components/drill/*` (intro → prompt → input → feedback → next → summary) | 🔴     | C     | 7.4           | ⬜     |
| 7.6 | Hint chip component      | `src/components/drill/HintChip.tsx`                                                                                       | 🟢     | X     | 7.5 contract  | ⬜     |
| 7.7 | XP integration           | call RPC from finish endpoint                                                                                             | 🟢     | C     | 3.2           | ⬜     |
| 7.8 | E2E test                 | `e2e/verb-drill.spec.ts` — Playwright happy path                                                                          | 🟡     | C     | 7.5           | ⬜     |

**Acceptance:** User opens `/verbs/etre/drill`, gets 10 leveled prompts mixing tenses, sees inline corrections w/ hints, finishes with XP awarded.

---

## Phase 8 — AI Bundle (HIGH — Claude)

| #   | Task                                   | Files                                                                                    | Effort | Owner | Depends  | Status |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ------ | ----- | -------- | ------ |
| 8.1 | Anthropic client wrapper               | `src/lib/ai/client.ts` — singleton, prompt caching, retry/backoff, cost logging          | 🔴     | C     | —        | ⬜     |
| 8.2 | System prompts (Marie, writing, hints) | `src/lib/ai/prompts/*.ts` — cached blocks                                                | 🔴     | C     | 8.1      | ⬜     |
| 8.3 | Writing feedback endpoint              | `src/app/api/ai/writing-feedback/route.ts` — populates `writing_submissions.ai_feedback` | 🔴     | C     | 8.1, 8.2 | ⬜     |
| 8.4 | Smart hints endpoint                   | `src/app/api/ai/hint/route.ts` — invoked after second wrong attempt                      | 🔴     | C     | 8.1, 8.2 | ⬜     |
| 8.5 | Explain endpoint                       | `src/app/api/ai/explain/route.ts` — "why is this wrong?" with grammar md as RAG          | 🔴     | C     | 8.1, 8.2 | ⬜     |
| 8.6 | Writing feedback panel UI              | `src/components/writing/FeedbackPanel.tsx`                                               | 🟢     | X     | 8.3      | ⬜     |
| 8.7 | Hint button + chip in exercises        | extend ExerciseRunner                                                                    | 🟢     | X     | 8.4      | ⬜     |
| 8.8 | Explain modal                          | `src/components/exercises/ExplainModal.tsx`                                              | 🟢     | X     | 8.5      | ⬜     |

---

## Phase 9 — Engagement Features (MED — Codex with Claude review)

| #   | Task                        | Files                                                                  | Effort | Owner | Depends | Status |
| --- | --------------------------- | ---------------------------------------------------------------------- | ------ | ----- | ------- | ------ |
| 9.1 | Hearts indicator in header  | `src/components/layout/Header.tsx`                                     | 🟢     | X     | 3.4     | ⬜     |
| 9.2 | Daily challenge picker      | `src/lib/services/challenge.service.ts` + cron task                    | 🟡     | C     | 3.1     | ⬜     |
| 9.3 | Daily challenge card        | `src/components/dashboard/DailyChallengeCard.tsx`                      | 🟢     | X     | 9.2     | ⬜     |
| 9.4 | Streak freeze purchase UI   | profile or shop component                                              | 🟢     | X     | 3.3     | ⬜     |
| 9.5 | Achievement unlock engine   | extend XP RPC to detect unlock events; insert into `user_achievements` | 🟡     | C     | 3.1     | ⬜     |
| 9.6 | Achievement toast on unlock | `src/components/gamification/AchievementToast.tsx`                     | 🟢     | X     | 9.5     | ⬜     |

---

## Phase 10 — Frontend Resilience (LOW/MED — Codex)

| #    | Task                               | Files                                         | Effort | Owner | Depends | Status |
| ---- | ---------------------------------- | --------------------------------------------- | ------ | ----- | ------- | ------ |
| 10.1 | Empty states across all list pages | various                                       | 🟢     | X     | —       | ⬜     |
| 10.2 | Loading skeletons                  | new `src/components/ui/Skeleton.tsx` + usages | 🟢     | X     | —       | ⬜     |
| 10.3 | Error boundaries per route segment | new `error.tsx` in each top route             | 🟢     | X     | —       | ⬜     |
| 10.4 | Form-level zod error rendering     | `src/components/form/FieldError.tsx`          | 🟢     | X     | —       | ⬜     |
| 10.5 | Offline indicator                  | `src/components/layout/OfflineBanner.tsx`     | 🟢     | X     | —       | ⬜     |
| 10.6 | A11y pass (focus rings, ARIA, alt) | UI files                                      | 🟡     | X     | 0.9     | ⬜     |

---

## Phase 11 — Content Expansion (Codex)

| #    | Task                                                   | Files                            | Effort | Owner | Depends | Status |
| ---- | ------------------------------------------------------ | -------------------------------- | ------ | ----- | ------- | ------ |
| 11.1 | A2 vocabulary JSON (~180 words)                        | `data/a2/vocabulary.json`        | 🟡     | X     | 1.1     | ⬜     |
| 11.2 | A2 grammar (passé composé, imparfait, futur proche, …) | `data/a2/grammar.json`           | 🟡     | X     | 1.2     | ⬜     |
| 11.3 | A2 reading/listening/writing                           | `data/a2/*.json`                 | 🟢     | X     | —       | ⬜     |
| 11.4 | A2 structure                                           | `data/a2/structure.json`         | 🟡     | X     | —       | ⬜     |
| 11.5 | B1 set (same shape, ~250 vocab)                        | `data/b1/*`                      | 🟡     | X     | 11.1–4  | ⬜     |
| 11.6 | B2 set                                                 | `data/b2/*`                      | 🟡     | X     | 11.5    | ⬜     |
| 11.7 | C1 set                                                 | `data/c1/*`                      | 🟡     | X     | 11.6    | ⬜     |
| 11.8 | Lefff bulk verb import (7k verbs)                      | run `scripts/import-verbiste.js` | 🟡     | X     | 0.8     | ⬜     |
| 11.9 | Lexique 3 bulk (optional, non-commercial)              | run `scripts/import-lexique3.py` | 🟡     | X     | —       | ⬜     |

---

## Parallel execution map

```
[NOW]                                       [+1 day]              [+3 days]              [+1 week]
─────────────────────────────────────────────────────────────────────────────────────────────────────
Codex 1: Task A (vocab import)  ──►  Task E (prefs UI)  ─►  Phase 11.1–4 (A2 content)
Codex 2: Task D (✅ done)           Task B + C (grammar+hints)   Phase 10.x (resilience)
Codex 3: Tasks F + G (mobile+rename) ─► Task H (API tests)
                                                                              ↘
Claude  : Phase 2 (grader edge cases) ──► Phase 3 (XP atomicity) ──► Phase 7 (verb drill) ──► Phase 8 (AI)
─────────────────────────────────────────────────────────────────────────────────────────────────────
```

**Critical path:** Phase 2 (grader) → Phase 7 (drill) → Phase 8 (AI). These three deliver the demo-able product.

**Independent of critical path:** Codex tracks (content + UI + tests + resilience) can run any time.

---

## Suggested first 3 spawns + Claude focus

**Spawn now (parallel):**

1. **Codex 1** — Task A (vocab importer) — paste prompt from previous chat message
2. **Codex 2** — Tasks B + C bundled (grammar seeder + hint dictionary) — both content, related, ~3 hrs total
3. **Codex 3** — Tasks F + G bundled (mobile nav + middleware rename) — ~30 min total

**Claude focuses on:** Phase 2 — grader edge cases (uses your data pack's grammar_edge_cases.md as source of truth). Output is the hint engine that turns wrong answers into targeted, actionable corrections.

When the three Codex agents finish, spawn the next wave:

- **Codex 1 next** — Task E (profile prefs UI)
- **Codex 2 next** — Phase 11.1 (A2 vocabulary)
- **Codex 3 next** — Task H (API tests)

---

## Done criteria for the whole project

The project is "shipped" when:

- All 9 Codex tasks A–I complete
- All 5 Claude workstreams (Phases 2–8) complete
- E2E test suite covers: signup → A1 lesson → SRS review → verb drill → writing submission with AI feedback
- Lighthouse a11y ≥ 95 on dashboard, lesson, review, verbs
- All 3 levels A2/B1 have at least 100 vocab + 15 grammar topics + 10 readings each
- Marie AI tutor works for one full conversation round
- Hearts/streak/XP atomic and timezone-safe
- Zero `any` types in `src/lib/`; zero unhandled errors leaving the server

Total estimated effort: ~3 weeks with 3 Codex agents + 1 Claude session running in parallel.
