-- Sprint 1.1 — Extend vocabulary with metadata from the curated data pack.
-- Additive only: existing rows keep working with NULLs in the new columns.

ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS en_alt           text;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS plural            text;       -- only when irregular
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS feminine          text;       -- adjectives + dual-gender nouns
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS feminine_plural   text;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS masculine_plural  text;
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS example_en        text;       -- English translation of `example`
ALTER TABLE public.vocabulary ADD COLUMN IF NOT EXISTS notes             text;       -- edge cases, false friends, register
