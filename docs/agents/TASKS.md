# Active Task Cards

Each section below is a self-contained task. The spawn prompt for an agent will reference one of these sections by letter (e.g. "your task is section A").

When an agent claims a task, it sets the **Owner** field. When a task ships, it moves to `## Done` at the bottom.

---

## A — Vocabulary Importer

**Branch:** `agents/content-vocab` · **Effort:** LOW · **Owner:** _unclaimed_

**Owns (write):**

- `scripts/import-vocab.ts` (new)
- npm script entry `"import:vocab"` in `package.json`

**Reads (don't modify):**

- `data/source/vocabulary_a1_a2.json` — 363 entries
- `scripts/import-verbs.ts` — use as template
- `supabase/migrations/20240101000006_extend_vocabulary.sql` — confirms target columns

**Field map (source → DB column):**
| Source | DB column |
|---|---|
| `fr` | `french` |
| `en` | `english` |
| `en_alt` | `en_alt` |
| `pos` | `part_of_speech` |
| `level` | `level_code` |
| `theme` | `theme` |
| `ipa` | `ipa` |
| `gender` | `gender` |
| `plural` | `plural` |
| `feminine` | `feminine` |
| `feminine_plural` | `feminine_plural` |
| `masculine_plural` | `masculine_plural` |
| `example_fr` | `example` |
| `example_en` | `example_en` |
| `notes` | `notes` |

**Done means:**

- `npm run import:vocab` upserts 363 rows; conflict on `(french, level_code)`
- Reports inserted/updated count
- Idempotent (re-runs are safe)
- `npm run type-check && npm run lint && npm run build` clean

---

## B — Grammar Topics Seeder

**Branch:** `agents/content-grammar` · **Effort:** MED · **Owner:** _unclaimed_

**Owns:**

- `scripts/seed-grammar-edge-cases.ts` (new)
- npm script `"seed:grammar-edge-cases"`

**Reads:**

- `data/source/grammar_edge_cases.md` — 17 sections
- existing `grammar_topics` schema in `supabase/migrations/20240101000000_initial_schema.sql`

**Done means:**

- Each `## N. Title` heading → one upserted row in `grammar_topics`
- `slug` = kebab-case of title (e.g. `articles-contractions`, `gender-traps`, `bags-adjectives`)
- `title`, `summary` (first paragraph), `content_md` (full section markdown), `examples` (jsonb — extract any code/example tables; otherwise `[]`), `level_code` per the rule:
  - sections 1–4 → `A1`
  - 5–7 → `A2`
  - 8–11 → `B1`
  - 12–17 → `B2`
- Idempotent (upsert on `slug`)
- All three checks clean

---

## C — Hint Dictionary JSON

**Branch:** `agents/content-hints` · **Effort:** LOW · **Owner:** _unclaimed_

**Owns:**

- `data/source/error-hints.json` (new — pure data file, no code)

**Reads:**

- `data/source/grammar_edge_cases.md` — only section 16 ("Quick error-flagging cheat sheet")

**Output schema:**

```json
{
  "_meta": { "version": "1", "source_section": "16" },
  "hints": [
    {
      "pattern": "je suis 25 ans",
      "diagnosis": "to be → age",
      "hint_fr": "Le français utilise « avoir » : j'ai 25 ans.",
      "hint_en": "French uses 'avoir': j'ai 25 ans.",
      "ref_section": "section-16"
    }
  ]
}
```

**Done means:**

- One entry per row of section 16's table
- Both `hint_fr` and `hint_en` populated
- File is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('data/source/error-hints.json','utf8'))"` succeeds)

---

## D — Design Tokens Migration

**Branch:** `agents/frontend-tokens` · **Effort:** MED · **Owner:** _unclaimed_

**Owns:**

- `tailwind.config.ts` or the v4 CSS theme block (check `src/app/globals.css`)
- All `.tsx` in `src/components/**` and `src/app/**` that use hex colors

**Tokens to define** (see `docs/agents/CONVENTIONS.md` for the full list).

**Done means:**

- Hardcoded brand hex values replaced with token classes / CSS vars
- Visually identical (no regression — eyeball before/after on dashboard, /verbs, /levels)
- All three checks clean

---

## E — Profile Preferences UI

**Branch:** `agents/frontend-prefs` · **Effort:** LOW · **Owner:** _unclaimed_

**Owns:**

- `src/app/(app)/profile/preferences-form.tsx` (new client component)
- `src/app/(app)/profile/page.tsx` (extend — render the form)
- `src/app/api/profile/preferences/route.ts` (new)
- `src/lib/validation/profile.ts` (new — explicitly assigned by this card)

**Reads:**

- migration 007 columns: `dialect_preference`, `spelling_preference`
- `src/app/api/srs/review/route.ts` as the API route style template
- `docs/agents/CONVENTIONS.md` for handler framework usage

**Done means:**

- Profile page shows two controls (Dialecte / Orthographe) with current values pre-filled
- POST `/api/profile/preferences` updates both fields
- Uses `withApiHandler`, `requireUser`, `parseJsonBody`, `enforceRateLimit(... RATE_LIMITS.write)`
- All three checks clean

---

## F — Mobile Nav: add Verbes

**Branch:** `agents/frontend-mobilenav` · **Effort:** LOW · **Owner:** _unclaimed_

**Owns:**

- `src/components/layout/MobileNav.tsx` only

**Done means:**

- Verbes entry added, mirroring the desktop addition in `Sidebar.tsx`
- Icon: `Repeat2` from `lucide-react`
- Route: `'/verbs' as Route`
- All three checks clean

---

## G — middleware → proxy rename (Next 16)

**Branch:** `agents/platform-proxy` · **Effort:** LOW · **Owner:** _unclaimed_

**Owns:**

- Rename `src/middleware.ts` → `src/proxy.ts` (sole change)

**Done means:**

- `npm run build` no longer prints "The middleware file convention is deprecated"
- Logic unchanged
- All three checks clean

---

## H — API Integration Tests

**Branch:** `agents/quality-api-tests` · **Effort:** MED · **Owner:** _unclaimed_

**Owns:**

- `src/tests/api/**` (new directory)
- May extend `vitest.config.ts` if needed (don't break existing config)

**Coverage matrix** (one suite per route, each suite covers these cases):
| Case | Status | Triggered by |
|---|---|---|
| anon | 401 | no session |
| bad UUID param | 400 | `[id]` not a UUID |
| bad body | 422 | zod fail |
| rate limited | 429 | exhaust bucket |
| happy path | 200 | valid request |

**Routes:**

1. `POST /api/exercises/[id]/submit`
2. `GET /api/srs/due`
3. `POST /api/srs/review`
4. `POST /api/writing/[id]/submit`
5. `POST /api/reading/[id]/complete`
6. `POST /api/listening/[id]/complete`
7. `GET /api/stats/me`
8. `GET /api/verbs`
9. `GET /api/verbs/[id]`

**Done means:**

- `npm test` passes with all suites green
- Mocks Supabase (no live DB)
- Resets the rate limiter between tests (`buckets.clear()` via test helper)

---

## I — Dead Code Removal

**Branch:** `agents/quality-cleanup` · **Effort:** LOW · **Owner:** _unclaimed_

**Procedure for each candidate:**

1. `grep -r 'FlashCard'  src/` — count imports.
2. If **zero** imports → delete file, commit with message `cleanup: remove unused FlashCard`.
3. If **any** imports → leave file alone, append a one-line note to `STATUS.md`.

**Candidates:**

- `src/components/exercises/FlashCard.tsx`
- `src/lib/placement/adapter.ts`
- `src/lib/placement/scorer.ts`
- `src/constants/routes.ts`
- `src/types/database.ts` (verify it's unused; do NOT delete `database.generated.ts`)

**Done means:**

- One commit per deleted file (easy revert)
- `npm run type-check && npm run lint && npm run build` clean
- `STATUS.md` updated with what was deleted vs kept

---

## Done

_(empty)_
