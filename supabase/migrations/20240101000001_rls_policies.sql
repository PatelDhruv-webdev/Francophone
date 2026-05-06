-- Row Level Security Policies
-- Three patterns: public_read, user_scoped, profile

-- ── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ability_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- ── PATTERN A: Public read (content tables — no client writes) ───────────────

CREATE POLICY "levels_public_read" ON public.levels FOR SELECT USING (true);
CREATE POLICY "achievements_public_read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "units_public_read" ON public.units FOR SELECT USING (true);
CREATE POLICY "chapters_public_read" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "lessons_public_read" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "vocabulary_public_read" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "grammar_topics_public_read" ON public.grammar_topics FOR SELECT USING (true);
CREATE POLICY "reading_texts_public_read" ON public.reading_texts FOR SELECT USING (true);
CREATE POLICY "writing_prompts_public_read" ON public.writing_prompts FOR SELECT USING (true);
CREATE POLICY "speaking_prompts_public_read" ON public.speaking_prompts FOR SELECT USING (true);
CREATE POLICY "listening_clips_public_read" ON public.listening_clips FOR SELECT USING (true);

-- exercises: REVOKE direct access, use exercises_public view instead
-- (correct_answer is hidden by the view)
REVOKE SELECT ON public.exercises FROM authenticated, anon;
REVOKE SELECT ON public.exercises FROM public;

-- ── exercises_public VIEW: hides correct_answer from all client queries ───────

CREATE OR REPLACE VIEW public.exercises_public AS
  SELECT
    id,
    lesson_id,
    type,
    prompt,
    data,
    difficulty,
    level_code,
    tags,
    order_index
  FROM public.exercises;

GRANT SELECT ON public.exercises_public TO authenticated, anon;

-- ── PATTERN B: User-scoped (user progress tables) ────────────────────────────

-- profiles
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_progress
CREATE POLICY "user_progress_own_select" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_progress_own_insert" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_own_update" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_exercise_attempts
CREATE POLICY "attempts_own_select" ON public.user_exercise_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_own_insert" ON public.user_exercise_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- srs_cards
CREATE POLICY "srs_cards_own_select" ON public.srs_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "srs_cards_own_insert" ON public.srs_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "srs_cards_own_update" ON public.srs_cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- writing_submissions
CREATE POLICY "writing_own_select" ON public.writing_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "writing_own_insert" ON public.writing_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ability_test_results
CREATE POLICY "placement_own_select" ON public.ability_test_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "placement_own_insert" ON public.ability_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_skill_scores
CREATE POLICY "skill_scores_own_select" ON public.user_skill_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skill_scores_own_upsert" ON public.user_skill_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skill_scores_own_update" ON public.user_skill_scores
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_achievements
CREATE POLICY "achievements_own_select" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_own_insert" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_activity
CREATE POLICY "daily_activity_own_select" ON public.daily_activity
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_activity_own_insert" ON public.daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_activity_own_update" ON public.daily_activity
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
