-- FrancoPath Initial Schema
-- Run: supabase db reset (local) or supabase db push (production)

-- ── Reference tables ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.levels (
  code          text PRIMARY KEY,          -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  title         text NOT NULL,             -- 'Beginner'
  description   text NOT NULL,
  order_index   integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text NOT NULL,
  icon        text NOT NULL,              -- lucide icon name
  xp_reward   integer NOT NULL DEFAULT 0
);

-- ── User profile ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        text UNIQUE,
  display_name    text,
  avatar_url      text,
  current_level   text DEFAULT 'A1' REFERENCES public.levels(code),
  xp              integer NOT NULL DEFAULT 0,
  streak_days     integer NOT NULL DEFAULT 0,
  last_active_at  timestamptz,
  ui_language     text DEFAULT 'en',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── Content hierarchy ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_code  text NOT NULL REFERENCES public.levels(code),
  title       text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id  uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title       text NOT NULL,
  type        text NOT NULL,              -- 'grammar','vocabulary','reading','writing','speaking','listening','quiz'
  content     jsonb NOT NULL DEFAULT '{}',
  xp_reward   integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL
);

-- ── Exercises (correct_answer protected by view) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.exercises (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  type           text NOT NULL,
  prompt         text NOT NULL,
  data           jsonb NOT NULL,          -- type-specific payload (no answer here)
  correct_answer jsonb NOT NULL,          -- NEVER exposed to client; hidden by exercises_public view
  difficulty     integer NOT NULL DEFAULT 1,
  level_code     text NOT NULL REFERENCES public.levels(code),
  tags           text[] NOT NULL DEFAULT '{}',
  order_index    integer NOT NULL DEFAULT 0
);

-- ── Content tables ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vocabulary (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  french         text NOT NULL,
  english        text NOT NULL,
  ipa            text,
  audio_url      text,
  image_url      text,
  example_fr     text,
  example_en     text,
  theme          text NOT NULL,
  level_code     text NOT NULL REFERENCES public.levels(code),
  gender         text,                    -- 'm', 'f', 'mf', null
  part_of_speech text NOT NULL DEFAULT 'noun'
);

CREATE TABLE IF NOT EXISTS public.grammar_topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  level_code  text NOT NULL REFERENCES public.levels(code),
  summary     text NOT NULL,
  content_md  text NOT NULL,
  examples    jsonb NOT NULL DEFAULT '[]',
  order_index integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reading_texts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  level_code         text NOT NULL REFERENCES public.levels(code),
  body_md            text NOT NULL,
  word_count         integer NOT NULL,
  estimated_minutes  integer NOT NULL,
  source             text,
  audio_url          text
);

CREATE TABLE IF NOT EXISTS public.writing_prompts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  prompt      text NOT NULL,
  level_code  text NOT NULL REFERENCES public.levels(code),
  min_words   integer NOT NULL,
  max_words   integer NOT NULL,
  rubric      jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS public.speaking_prompts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_fr     text NOT NULL,
  audio_url   text,
  level_code  text NOT NULL REFERENCES public.levels(code),
  focus       text                        -- 'nasal vowels', 'liaison', etc.
);

CREATE TABLE IF NOT EXISTS public.listening_clips (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  audio_url        text NOT NULL,
  transcript       text NOT NULL,
  translation      text NOT NULL,
  level_code       text NOT NULL REFERENCES public.levels(code),
  duration_seconds integer NOT NULL,
  questions        jsonb NOT NULL DEFAULT '[]'
);

-- ── User progress ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id    uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'not_started',
  score        integer,
  attempts     integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.user_exercise_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  user_answer  jsonb NOT NULL,
  is_correct   boolean NOT NULL,
  time_taken_ms integer,
  attempted_at timestamptz DEFAULT now()
);

-- ── SRS ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.srs_cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type     text NOT NULL,            -- 'vocabulary', 'grammar', 'phrase'
  item_id       uuid NOT NULL,
  ease_factor   numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 0,
  repetitions   integer NOT NULL DEFAULT 0,
  due_date      date NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed timestamptz,
  UNIQUE (user_id, item_type, item_id)
);

-- ── Writing submissions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.writing_submissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id    uuid NOT NULL REFERENCES public.writing_prompts(id) ON DELETE CASCADE,
  content      text NOT NULL,
  word_count   integer NOT NULL,
  ai_feedback  jsonb,
  score        integer,
  submitted_at timestamptz DEFAULT now()
);

-- ── Placement test ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ability_test_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estimated_level text NOT NULL,
  scores          jsonb NOT NULL DEFAULT '{}',
  taken_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_skill_scores (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill      text NOT NULL,              -- 'vocab','grammar','reading','writing','speaking','listening'
  score      numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, skill)
);

-- ── Gamification ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.daily_activity (
  user_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date        date NOT NULL,
  xp_earned            integer NOT NULL DEFAULT 0,
  exercises_completed  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);
