-- Performance indexes
-- All hot-path queries are covered here.

-- SRS due cards query (hot path: every /review page load)
CREATE INDEX IF NOT EXISTS idx_srs_cards_due
  ON public.srs_cards (user_id, due_date);

-- User progress lookup per lesson
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson
  ON public.user_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_status
  ON public.user_progress (user_id, status);

-- Exercise fetching by lesson (ordered)
CREATE INDEX IF NOT EXISTS idx_exercises_lesson
  ON public.exercises (lesson_id, order_index);

-- Vocabulary queries by level + theme
CREATE INDEX IF NOT EXISTS idx_vocabulary_level_theme
  ON public.vocabulary (level_code, theme);

-- Stats: daily activity heatmap (range query by date)
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date
  ON public.daily_activity (user_id, activity_date DESC);

-- Achievement lookup (ordered by unlock time)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements (user_id, unlocked_at DESC);

-- Exercise attempts for weak-areas analysis
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_correct
  ON public.user_exercise_attempts (user_id, is_correct, attempted_at DESC);

-- SRS items by type (vocabulary lookups)
CREATE INDEX IF NOT EXISTS idx_srs_cards_item
  ON public.srs_cards (item_type, item_id);

-- Lessons ordered within chapter
CREATE INDEX IF NOT EXISTS idx_lessons_chapter
  ON public.lessons (chapter_id, order_index);

-- Grammar topics ordered within level
CREATE INDEX IF NOT EXISTS idx_grammar_topics_level
  ON public.grammar_topics (level_code, order_index);

-- Reading texts by level
CREATE INDEX IF NOT EXISTS idx_reading_texts_level
  ON public.reading_texts (level_code);

-- Writing prompts by level
CREATE INDEX IF NOT EXISTS idx_writing_prompts_level
  ON public.writing_prompts (level_code);

-- Full-text search on vocabulary (French + English)
CREATE INDEX IF NOT EXISTS idx_vocabulary_french_fts
  ON public.vocabulary USING gin(to_tsvector('french', french));

CREATE INDEX IF NOT EXISTS idx_vocabulary_english_fts
  ON public.vocabulary USING gin(to_tsvector('english', english));
