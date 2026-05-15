-- Sprint 1.3 — Extend profiles with dialect/spelling preferences and hearts/lives.
-- Additive only.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dialect_preference   text NOT NULL DEFAULT 'fr-fr'
    CHECK (dialect_preference IN ('fr-fr', 'fr-ca'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spelling_preference  text NOT NULL DEFAULT 'traditional'
    CHECK (spelling_preference IN ('traditional', 'reform-1990'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hearts                integer NOT NULL DEFAULT 5
    CHECK (hearts >= 0 AND hearts <= 5);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hearts_refilled_at    timestamptz;
