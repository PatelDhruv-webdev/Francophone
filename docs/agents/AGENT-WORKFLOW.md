# Agent Workflow — Core-First Execution

This file is the single source of truth for **which agent runs when** and **what to paste to start it**. Spawn agents wave by wave; do not start a wave until the previous wave's branches are merged into `main`.

> **Path note:** the workspace path is `/Users/dhruv/conductor/workspaces/francophone/lagos`. Some older spawn prompts in `docs/agents/TASKS.md` still reference an outdated `bilbao` path — **ignore those and use the prompts in this file instead.**

---

## Why three waves (core-first, design last)

1. **Wave 1 — Core data + core grader logic.** Ships the data the grader consumes and the grader itself. Six parallel-safe agents.
2. **Wave 2 — Backend behavior + tests.** XP/streak atomicity, SRS robustness, AI features, API tests. Four parallel-safe agents. Backend contracts freeze here.
3. **Wave 3 — Design / UX.** One agent. All UI polish, missing pages, empty states, a11y. Runs only after backends are stable so it has no moving targets.

Inside a wave, agents own non-overlapping directories so they cannot conflict. Across waves, the gate is "previous wave merged."

---

## Wave 1 — Core Data + Core Logic (parallel, ~3–5 days)

| Slot | Role                                   | Branch                   | Tool       | Task                          |
| ---- | -------------------------------------- | ------------------------ | ---------- | ----------------------------- |
| 1A   | Content / Vocabulary importer          | `agents/content-vocab`   | Codex      | TASKS §A · CODING-PLAN 1.1    |
| 1B   | Content / Grammar topics seeder        | `agents/content-grammar` | Codex      | TASKS §B · CODING-PLAN 1.2    |
| 1C   | Content / Hint dictionary              | `agents/content-hints`   | Codex      | TASKS §C · CODING-PLAN 1.3    |
| 1D   | Platform / `middleware`→`proxy` rename | `agents/platform-proxy`  | Codex      | TASKS §G · CODING-PLAN 1.5    |
| 1E   | Quality / dead-code removal            | `agents/quality-cleanup` | Codex      | TASKS §I · CODING-PLAN 1.8    |
| 1F   | **Domain / Grader edge cases** (HIGH)  | `agents/domain-grader`   | **Claude** | CODING-PLAN Phase 2 (2.1–2.9) |

**Recommended first three to spawn:** 1A + 1F + (1D or 1E). 1F is the long pole — start it first.

---

## Wave 2 — Backend Core + Quality (parallel, ~4–6 days, gated on Wave 1 merge)

| Slot | Role                                                                 | Branch                     | Tool                            | Task                          |
| ---- | -------------------------------------------------------------------- | -------------------------- | ------------------------------- | ----------------------------- |
| 2A   | **Domain / XP atomicity + streak freeze + hearts** (HIGH)            | `agents/domain-xp`         | **Claude**                      | CODING-PLAN Phase 3 (3.1–3.7) |
| 2B   | **Domain / SRS robustness** (MED)                                    | `agents/domain-srs`        | **Claude**                      | CODING-PLAN Phase 4 (4.1–4.5) |
| 2C   | **AI / Anthropic client + writing feedback + hint + explain** (HIGH) | `agents/ai-bundle`         | **Claude** (`claude-api` skill) | CODING-PLAN Phase 8           |
| 2D   | Quality / API integration tests                                      | `agents/quality-api-tests` | Codex                           | TASKS §H · CODING-PLAN 1.7    |

**Backend contracts freeze at end of Wave 2.** No further changes to API response shapes or grader output without orchestrator approval.

---

## Wave 3 — Design / UX Polish (single agent, ~3–4 days, gated on Wave 2 merge)

| Slot | Role                        | Branch                 | Tool  | Task                                                |
| ---- | --------------------------- | ---------------------- | ----- | --------------------------------------------------- |
| 3A   | **Design (UI / UX / a11y)** | `agents/design-polish` | Codex | TASKS §E + §F + CODING-PLAN Phase 9 (UI) + Phase 10 |

Owns: `src/components/**`, `src/app/(app)/**/page.tsx`, Tailwind config, public assets.
Never touches: `src/app/api/**`, `src/lib/api/**`, `src/lib/services/**`, `src/lib/grading/**`, `src/lib/ai/**`, `src/middleware.ts` / `src/proxy.ts`, `next.config.ts`, `supabase/migrations/**`, `src/lib/env.ts`.

---

## Per-agent workflow checklist (every agent follows this)

1. **Branch.** Create from latest `main`: `git checkout main && git pull && git checkout -b <branch>`.
2. **Read in order:**
   1. `docs/agents/STARTER.md`
   2. `docs/agents/CHARTERS.md` — find your role
   3. `docs/agents/CONVENTIONS.md`
   4. `docs/agents/AGENT-WORKFLOW.md` — find your slot
   5. The task source named in your spawn prompt (`TASKS.md §X` and/or `CODING-PLAN.md` rows)
   6. Any code references your spawn prompt names (template/service/contract files)
3. **Summarize back** to the orchestrator: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria. **Wait for "go" before any edit.**
4. **Implement.** Small frequent commits, conventional message style.
5. **Run before stopping:** `npm run type-check && npm run lint && npm run build`. Add `npm test` if you own tests.
6. **Log in `STATUS.md`.** Append one line under today's date: `slot · branch · what shipped · blockers (if any)`.
7. **Push your branch only.** Never push to `main`. Orchestrator reviews and merges.

---

## Spawn prompts (copy-paste, one per slot)

Each prompt is self-contained. Paste as the **first message** of a fresh agent session.

---

### ▶ Slot 1A — Content / Vocabulary importer

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/content-vocab
Your wave / slot: 1 / 1A
Your role: Content

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Content agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1A
  5. docs/agents/TASKS.md  → section A (full field map)
  6. docs/agents/CODING-PLAN.md  → row 1.1
  7. scripts/import-verbs.ts  → use as the template
  8. data/source/vocabulary_a1_a2.json  → 363-entry source

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria.
Wait for my "go" before any edit.

End the session by:
  - npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/content-vocab — DO NOT push to main
```

---

### ▶ Slot 1B — Content / Grammar topics seeder

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/content-grammar
Your wave / slot: 1 / 1B
Your role: Content

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Content agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1B
  5. docs/agents/TASKS.md  → section B (slug rules + level mapping)
  6. docs/agents/CODING-PLAN.md  → row 1.2
  7. data/source/grammar_edge_cases.md  → the source you'll parse
  8. scripts/import-verbs.ts  → mirror its Supabase service-role pattern

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria.
Wait for my "go" before any edit.

End the session by:
  - npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/content-grammar — DO NOT push to main
```

---

### ▶ Slot 1C — Content / Hint dictionary JSON

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/content-hints
Your wave / slot: 1 / 1C
Your role: Content

This task produces a PURE DATA FILE (no code). One JSON object per row of section 16
("Quick error-flagging cheat sheet") of grammar_edge_cases.md.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Content agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1C
  5. docs/agents/TASKS.md  → section C (output schema is fixed)
  6. docs/agents/CODING-PLAN.md  → row 1.3 (this feeds Phase 2's grader)
  7. data/source/grammar_edge_cases.md  → section 16 only

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria.
Wait for my "go" before any edit.

End the session by:
  - validate: node -e "JSON.parse(require('fs').readFileSync('data/source/error-hints.json','utf8'))"
  - npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/content-hints — DO NOT push to main
```

---

### ▶ Slot 1D — Platform / `middleware` → `proxy` rename

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/platform-proxy
Your wave / slot: 1 / 1D
Your role: Platform (single-file support task)

This task is ONE rename: src/middleware.ts → src/proxy.ts. NO logic change. NO other files.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Platform support task
  3. docs/agents/CONVENTIONS.md  → Next.js 16 specifics
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1D
  5. docs/agents/TASKS.md  → section G
  6. docs/agents/CODING-PLAN.md  → row 1.5

Then summarize back: role, branch, wave/slot, owned dirs (only that one file), never-touch dirs, done criteria.
Wait for my "go" before any edit.

End the session by:
  - npm run type-check && npm run lint && npm run build
  - confirm the "middleware file convention is deprecated" warning is gone
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/platform-proxy — DO NOT push to main
```

---

### ▶ Slot 1E — Quality / dead-code removal

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/quality-cleanup
Your wave / slot: 1 / 1E
Your role: Quality

STRICT procedure: grep first, delete only if zero references.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Quality agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1E
  5. docs/agents/TASKS.md  → section I (full candidate list + procedure)
  6. docs/agents/CODING-PLAN.md  → row 1.8

For each candidate file, run `grep -rE "<symbol>" src/` BEFORE proposing deletion.
Never delete a file without grep confirming zero refs.

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus your grep result per candidate file (kept vs delete).
Wait for my "go" before any edit. One commit per deleted file (easy revert).

End the session by:
  - npm run type-check && npm run lint && npm run build
  - listing kept-vs-deleted in today's STATUS.md line
  - committing on agents/quality-cleanup — DO NOT push to main
```

---

### ▶ Slot 1F — Domain / Grader edge cases (HIGH — Claude)

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/domain-grader
Your wave / slot: 1 / 1F
Your role: Domain (grader logic)

You own the entire Phase 2 block (rows 2.1 → 2.9). Execute sub-tasks in numeric order;
each builds on the previous. Write tests alongside each sub-task.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Domain agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 1F
  5. docs/agents/CODING-PLAN.md  → Phase 2 in full (rows 2.1 through 2.9)
  6. data/source/grammar_edge_cases.md  → THE source of truth for every rule
  7. src/lib/grading/{index,graders,normalizer}.ts  → existing grader (extend, don't rewrite)
  8. src/lib/services/verbs.service.ts  → the verbs you'll grade against
  9. supabase/migrations/20240101000005_create_verbs.sql  → verbs schema
  10. src/lib/validation/exercises.ts  → you may extend ONLY the response schema (add hint?: { fr, en })

Owned dirs (write):
  - src/lib/grading/**
  - src/tests/unit/grading/**
  - src/lib/validation/exercises.ts  (response schema extension only)

Never touch:
  - src/app/api/**, src/lib/api/**, src/lib/env.ts
  - src/middleware.ts / src/proxy.ts, next.config.ts
  - supabase/migrations/**
  - any frontend file (src/components/**, src/app/(app)/**)

Hard requirements:
  - Zero new dependencies.
  - Sub-task order: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9.
  - After each sub-task: npm test src/tests/unit/grading green before moving on.
  - Acceptance for the slot: a user submitting "je suis 25 ans" gets correct=false and
    hint.fr starting with "Le français utilise « avoir »".

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus your sub-task plan (2.1 → 2.9 in order, what each touches).
Wait for my "go" before any edit.

End the session by:
  - npm test && npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/domain-grader — DO NOT push to main
```

---

### ▶ Slot 2A — Domain / XP atomicity + streak freeze + hearts (HIGH — Claude)

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/domain-xp
Your wave / slot: 2 / 2A
Your role: Domain (gamification core)

Goal: race-free, timezone-safe XP/streak/hearts. Move multi-statement JS into a single
Postgres transaction so parallel calls cannot drop updates.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Domain agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 2A
  5. docs/agents/CODING-PLAN.md  → Phase 3 rows 3.1 → 3.7 in full
  6. src/lib/xp/awards.ts  → current implementation (refactor to RPC)
  7. src/lib/xp/streak.ts  → existing streak math
  8. src/constants/xp.ts  → action keys / award amounts
  9. supabase/migrations/20240101000007_extend_profiles.sql  → hearts columns
  10. supabase/migrations/  → check ordering for your new file's timestamp

Owned dirs (write):
  - supabase/migrations/<new timestamp>_award_xp_rpc.sql
  - supabase/migrations/<new timestamp>_streak_freeze.sql
  - supabase/migrations/<new timestamp>_hearts_refill.sql  (or one combined file)
  - src/lib/xp/**
  - src/lib/time/day-bucket.ts  (new util)
  - src/tests/unit/xp/**

Never touch:
  - src/app/api/exercises/[id]/submit/route.ts beyond the minimum needed to call awardXP
    and to throw Forbidden on hearts=0 (3.5 hook). Keep the diff small and obvious.
  - any frontend file
  - any other migration file
  - src/lib/grading/**

Acceptance:
  - Two parallel award_xp calls for the same user reflect both deltas.
  - A user missing exactly one day with one streak_freeze keeps the streak.
  - Hearts refill exactly every 4 hours, capped at 5.
  - day-bucket.ts is the only place new code reads "today" for streak math.

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus the SQL signature you propose for award_xp(p_user_id uuid, p_action text).
Wait for my "go" before any edit.

End the session by:
  - npm test && npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/domain-xp — DO NOT push to main
```

---

### ▶ Slot 2B — Domain / SRS robustness (MED — Claude)

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/domain-srs
Your wave / slot: 2 / 2B
Your role: Domain (SRS)

Goal: harden the SRS against orphan items, q=0 edge, double-review in same session,
ease-factor floor.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Domain agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 2B
  5. docs/agents/CODING-PLAN.md  → Phase 4 rows 4.1 → 4.5 in full
  6. src/lib/srs/algorithm.ts  → SM-2 implementation
  7. src/lib/services/srs.service.ts  → due-list query
  8. src/app/api/srs/{due,review}/route.ts  → routes (read only)

Owned dirs (write):
  - src/lib/srs/**
  - supabase/migrations/<new timestamp>_delete_orphan_srs.sql
  - src/tests/unit/srs/**

Never touch:
  - src/app/api/srs/** route files (your changes flow via the service layer)
  - any other migration
  - any frontend file
  - src/lib/grading/**, src/lib/xp/**, src/lib/ai/**

Acceptance:
  - q=0 resets interval, keeps card due, ease_factor never below 1.3.
  - Cards whose item_id no longer exists are skipped from due list and cleaned up
    by the periodic function.
  - Same card cannot be reviewed twice in the same session.

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria.
Wait for my "go" before any edit.

End the session by:
  - npm test && npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/domain-srs — DO NOT push to main
```

---

### ▶ Slot 2C — AI / Anthropic client + writing feedback + hint + explain (HIGH — Claude)

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/ai-bundle
Your wave / slot: 2 / 2C
Your role: AI (Anthropic SDK is installed but currently unused)

Goal: cached Anthropic client + three API routes (writing-feedback, hint, explain).
Use prompt caching for the system prompt that embeds grammar_edge_cases as RAG context.
Frontend UI for these is Wave 3's problem — ship APIs only.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → AI agent
  3. docs/agents/CONVENTIONS.md
  4. docs/agents/AGENT-WORKFLOW.md  → slot 2C
  5. docs/agents/CODING-PLAN.md  → Phase 8 in full
  6. src/lib/api/with-handler.ts  → wrap every new route with this
  7. src/lib/api/rate-limit.ts  → AI routes need a stricter preset
  8. src/lib/env.ts  → ANTHROPIC_API_KEY is already validated
  9. data/source/grammar_edge_cases.md  → RAG context
  10. src/app/api/srs/review/route.ts  → reference for route structure
  11. The claude-api skill triggers automatically when you import the Anthropic SDK; let it.

Owned dirs (write):
  - src/lib/ai/**
  - src/app/api/ai/writing-feedback/route.ts
  - src/app/api/ai/hint/route.ts
  - src/app/api/ai/explain/route.ts
  - src/lib/validation/ai.ts  (new zod contracts for AI responses)
  - src/tests/unit/ai/**  (mock the Anthropic client)

Never touch:
  - src/app/api/** outside src/app/api/ai/**
  - src/lib/grading/**, src/lib/xp/**, src/lib/srs/**
  - any frontend file (Wave 3 owns UI)
  - migrations

Hard requirements:
  - Use Anthropic prompt caching from the first commit. The system prompt that includes
    grammar_edge_cases.md must be cached.
  - Default model: claude-sonnet-4-6 (cost/quality balance for these calls).
  - All routes return a typed response per src/lib/validation/ai.ts.
  - Stream responses where the client benefits (writing-feedback). Buffer where it doesn't
    (hint, explain).

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus the model + cache strategy you propose.
Wait for my "go" before any edit.

End the session by:
  - npm test && npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/ai-bundle — DO NOT push to main
```

---

### ▶ Slot 2D — Quality / API integration tests

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/quality-api-tests
Your wave / slot: 2 / 2D
Your role: Quality

Goal: Vitest integration tests covering every wrapped API route. Mock Supabase. Reset
rate-limiter buckets between tests. Coverage matrix per route: 401, 422, 400 (bad UUID),
429, 200.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Quality agent
  3. docs/agents/CONVENTIONS.md  → Testing section
  4. docs/agents/AGENT-WORKFLOW.md  → slot 2D
  5. docs/agents/TASKS.md  → section H (full coverage matrix)
  6. docs/agents/CODING-PLAN.md  → row 1.7
  7. src/tests/unit/  → patterns to mirror
  8. src/lib/api/with-handler.ts and src/lib/api/rate-limit.ts  → what you're testing
  9. The full route list at src/app/api/**/route.ts  → tests must cover all of them,
     including any new routes shipped in Wave 1 (1F may add nothing; 2C will add three)

Owned dirs (write):
  - src/tests/api/**
  - vitest.config.ts  (extend, don't break existing config)

Never touch:
  - any route source file
  - any service / grading / AI code

Acceptance:
  - npm test green.
  - Each route has all five cases above where applicable (e.g. routes without a body
    skip 422 body case).
  - Mocks live in src/tests/api/_mocks/ (or similar) and reset between tests.

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus your mock strategy for @/lib/supabase/server and @/lib/supabase/admin.
Wait for my "go" before any edit.

End the session by:
  - npm test && npm run type-check && npm run lint && npm run build
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/quality-api-tests — DO NOT push to main
```

---

### ▶ Slot 3A — Design / UX polish (single agent — Codex)

```
You are joining FrancoPath at /Users/dhruv/conductor/workspaces/francophone/lagos.

Your branch: agents/design-polish
Your wave / slot: 3 / 3A
Your role: Design (UI / UX / a11y)

You are the ONLY design agent. You bundle every UI surface that's been deferred from
Waves 1 and 2. Backend contracts are frozen — call existing APIs, do not invent new
shapes; if a UI need is not covered by a contract, log it as a blocker and stop.

Read IN ORDER before editing anything:
  1. docs/agents/STARTER.md
  2. docs/agents/CHARTERS.md  → Frontend / Design agent
  3. docs/agents/CONVENTIONS.md  → token list, page conventions, Server Component rules
  4. docs/agents/AGENT-WORKFLOW.md  → slot 3A
  5. docs/agents/TASKS.md  → sections E (profile prefs UI) and F (mobile nav)
  6. docs/agents/CODING-PLAN.md  → Phase 9 (engagement UI) and Phase 10 (resilience/a11y)
  7. src/lib/validation/  → ALL zod contracts; treat as read-only API truth
  8. src/components/layout/Sidebar.tsx  → mirror its Verbes entry into MobileNav
  9. src/app/(app)/profile/page.tsx  → existing profile page to extend
  10. src/app/(app)/verbs/[id]/page.tsx  → reference Server Component pattern

Bundle of work (in this order):
  a. TASKS §F — MobileNav: add Verbes entry
  b. TASKS §E — Profile preferences UI + POST /api/profile/preferences
     (note: this route is the ONE backend file you're allowed to add, since it has
      no Wave 2 owner. Use withApiHandler/requireUser/parseJsonBody/enforceRateLimit.
      Add zod schema in src/lib/validation/profile.ts. After this is merged, treat
      the API surface as frozen again.)
  c. CODING-PLAN Phase 9 UI: hearts indicator in header, streak-freeze purchase modal,
     daily-challenge dashboard card
  d. AI surfaces (UI only — APIs already exist from slot 2C): writing-feedback panel,
     hint chip on exercises, explain modal
  e. CODING-PLAN Phase 10: empty states across pages, skeleton loaders, error boundaries,
     a11y pass (focus rings, ARIA labels, alt text for emoji, color contrast)

Owned dirs (write):
  - src/components/**
  - src/app/(app)/**/page.tsx and adjacent client components
  - src/styles/**, tailwind config (tokens already exist — extend if needed)
  - public/**
  - src/app/api/profile/preferences/route.ts  (the ONLY API route exception — see (b))
  - src/lib/validation/profile.ts  (the ONLY new contract — for that route only)

Never touch:
  - any other src/app/api/** route
  - src/lib/api/**, src/lib/services/**, src/lib/grading/**, src/lib/ai/**,
    src/lib/xp/**, src/lib/srs/**
  - src/middleware.ts / src/proxy.ts, next.config.ts, src/lib/env.ts
  - supabase/migrations/**

Acceptance:
  - Mobile nav has Verbes; matches desktop active-state styling.
  - /profile shows dialect + spelling toggles; persists across reload.
  - Hearts indicator visible in app header; updates on lose/refill.
  - Daily challenge card on dashboard.
  - Writing page renders AI feedback panel using existing /api/ai/writing-feedback.
  - Lighthouse a11y ≥ 95 on /dashboard, /verbs, /lesson/<id>.
  - Every list page has an empty state; every fetching surface has a skeleton.
  - npm run build clean; manual smoke of dashboard, /verbs, /lesson, /writing, /profile.

Then summarize back: role, branch, wave/slot, owned dirs, never-touch dirs, done criteria,
plus the sub-step order you'll execute (a → e above).
Wait for my "go" before any edit.

End the session by:
  - npm run type-check && npm run lint && npm run build
  - manual smoke as listed above
  - appending today's line in docs/agents/STATUS.md
  - committing on agents/design-polish — DO NOT push to main
```

---

## Orchestrator daily loop

A 5-minute checklist for the human running the show:

1. Open `docs/agents/STATUS.md`. Scan the day's lines per agent.
2. For every agent that says "ready for review":
   - `git checkout <branch> && git pull`
   - `npm run build && npm test`
   - Eyeball the diff against `main`.
   - Squash-merge to `main` if green; reply to the agent with concrete fix requests if not.
3. After Wave N's last branch merges, post in chat (or in `STATUS.md`) "Wave N+1 unblocked — spawn …" and paste the next wave's prompts.
4. If a Claude-driven slot ran out of budget mid-task: paste the agent's last `STATUS.md` line + "continue from here" rather than respawning cold. Cold respawns lose 30 min to re-reading.

---

## When this file is wrong

- Workspace path moved. Update the path at the top + every prompt.
- A wave's gating assumption breaks (e.g. Wave 1 task fails review and gets re-scoped). Update the wave table; do not silently start Wave 2.
- A new HIGH task appears mid-stream. Add a slot in the appropriate wave; never inline it into a running agent.
