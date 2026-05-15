-- Verbs reference table (Sprint 1.2)
-- Source: data/source/verbs_conjugated.json (35 high-edge-case verbs across 10 tenses)
-- Long-tail conjugations come from the Lefff bulk importer in Sprint 7.

CREATE TABLE IF NOT EXISTS public.verbs (
  id                 text PRIMARY KEY,                                -- stable slug, e.g. 'etre', 'avoir'
  infinitif          text NOT NULL UNIQUE,                            -- 'être', 'avoir'
  en                 text,
  level_code         text REFERENCES public.levels(code),             -- 'A1', 'A2', ...
  verb_group         integer,                                         -- 1 (-er) | 2 (-ir) | 3 (irregular)
  auxiliary          text,                                            -- 'avoir' | 'être'
  is_irregular       boolean NOT NULL DEFAULT false,
  edge_cases         text,                                            -- prose explanation of tricky behavior
  stem_changes       text,                                            -- spelling changes by tense
  participe_passe    text,
  participe_present  text,
  conjugations       jsonb NOT NULL DEFAULT '{}'::jsonb,              -- { present: {je, tu, …}, passe_compose: {…}, … }
  source             text NOT NULL DEFAULT 'manual',                  -- 'manual' | 'lefff' | 'verbiste'
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verbs_level     ON public.verbs(level_code);
CREATE INDEX IF NOT EXISTS idx_verbs_group     ON public.verbs(verb_group);
CREATE INDEX IF NOT EXISTS idx_verbs_aux       ON public.verbs(auxiliary);
CREATE INDEX IF NOT EXISTS idx_verbs_irregular ON public.verbs(is_irregular);

ALTER TABLE public.verbs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verbs_public_read"
  ON public.verbs
  FOR SELECT
  USING (true);
