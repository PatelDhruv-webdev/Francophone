-- ─── Reading Resources ────────────────────────────────────────────────────────
-- Links to external reading content (fabulang.com stories)

CREATE TABLE IF NOT EXISTS reading_resources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr        text NOT NULL,
  title_en        text NOT NULL,
  external_url    text NOT NULL,
  level_code      text NOT NULL CHECK (level_code IN ('A1','A2','B1','B2','C1','C2')),
  theme           text NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 5,
  order_index     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Track which reading resources a user has completed
CREATE TABLE IF NOT EXISTS user_reading_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES reading_resources(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  xp_awarded  integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, resource_id)
);

-- ─── Writing Prompts ──────────────────────────────────────────────────────────
-- Curated writing prompts with sentence starters and model answers

CREATE TABLE IF NOT EXISTS writing_prompts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  instructions      text NOT NULL,
  sentence_starters text[] NOT NULL DEFAULT '{}',
  model_answer      text NOT NULL,
  word_min          integer NOT NULL DEFAULT 30,
  word_max          integer NOT NULL DEFAULT 80,
  level_code        text NOT NULL CHECK (level_code IN ('A1','A2','B1','B2','C1','C2')),
  theme             text NOT NULL,
  topic             text NOT NULL,
  sub_topic         text,
  order_index       integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- User writing submissions
CREATE TABLE IF NOT EXISTS writing_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id   uuid NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  content     text NOT NULL,
  word_count  integer NOT NULL DEFAULT 0,
  xp_awarded  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Listening Videos ─────────────────────────────────────────────────────────
-- YouTube videos with embedded practice exercises

CREATE TABLE IF NOT EXISTS listening_videos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id       text NOT NULL UNIQUE,
  title            text NOT NULL,
  channel_name     text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  level_code       text NOT NULL CHECK (level_code IN ('A1','A2','B1','B2','C1','C2')),
  theme            text NOT NULL,
  description      text,
  transcript       text,
  exercises        jsonb NOT NULL DEFAULT '[]',
  order_index      integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Track which videos a user has completed
CREATE TABLE IF NOT EXISTS user_listening_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    uuid NOT NULL REFERENCES listening_videos(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  xp_awarded  integer NOT NULL DEFAULT 0,
  score       integer NOT NULL DEFAULT 0,   -- 0-100
  UNIQUE (user_id, video_id)
);

-- ─── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE reading_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listening_progress ENABLE ROW LEVEL SECURITY;

-- Public content: anyone can read
CREATE POLICY "reading_resources_public_read"
  ON reading_resources FOR SELECT USING (true);

CREATE POLICY "writing_prompts_public_read"
  ON writing_prompts FOR SELECT USING (true);

CREATE POLICY "listening_videos_public_read"
  ON listening_videos FOR SELECT USING (true);

-- User progress: own rows only
CREATE POLICY "user_reading_progress_select"
  ON user_reading_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_reading_progress_insert"
  ON user_reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "writing_submissions_select"
  ON writing_submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "writing_submissions_insert"
  ON writing_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_listening_progress_select"
  ON user_listening_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_listening_progress_insert"
  ON user_listening_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_reading_resources_level
  ON reading_resources (level_code, order_index);

CREATE INDEX idx_user_reading_progress_user
  ON user_reading_progress (user_id);

CREATE INDEX idx_writing_prompts_level_topic
  ON writing_prompts (level_code, topic, order_index);

CREATE INDEX idx_writing_submissions_user
  ON writing_submissions (user_id, created_at DESC);

CREATE INDEX idx_listening_videos_level
  ON listening_videos (level_code, order_index);

CREATE INDEX idx_user_listening_progress_user
  ON user_listening_progress (user_id);
