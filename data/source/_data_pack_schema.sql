-- FrancoPath Database Schema (Supabase / PostgreSQL)
-- Run this in your Supabase SQL editor before running the import scripts.

-- ===============================================
-- VOCABULARY TABLE
-- ===============================================
create table if not exists vocabulary (
  id text primary key,
  fr text not null,
  en text,
  en_alt text,
  pos text not null,                -- noun, verb, adjective, adverb, etc.
  level text,                       -- A1, A2, B1, B2, C1, C2
  theme text,                       -- greetings, food, family, etc.
  ipa text,                         -- IPA pronunciation
  gender text,                      -- m, f, mf
  plural text,                      -- only if irregular
  feminine text,                    -- for adjectives + dual-gender nouns
  feminine_plural text,
  masculine_plural text,
  example_fr text,
  example_en text,
  notes text,
  freq_film numeric,                -- frequency from Lexique 3
  freq_book numeric,
  source text,                      -- 'manual' | 'lexique3' | 'cefrlex'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vocab_level on vocabulary(level);
create index if not exists idx_vocab_theme on vocabulary(theme);
create index if not exists idx_vocab_pos on vocabulary(pos);
create index if not exists idx_vocab_fr on vocabulary(fr);

-- ===============================================
-- VERBS TABLE
-- ===============================================
create table if not exists verbs (
  id text primary key,
  infinitif text not null unique,
  en text,
  level text,
  "group" int,                      -- 1, 2, or 3
  auxiliary text,                   -- avoir | être
  is_irregular boolean default false,
  edge_cases text,                  -- explanation of tricky behavior
  stem_changes text,
  participe_passe text,
  participe_present text,
  conjugations jsonb,               -- nested object with all tenses
  source text,                      -- 'manual' | 'lefff' | 'verbiste'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_verbs_infinitif on verbs(infinitif);
create index if not exists idx_verbs_group on verbs("group");
create index if not exists idx_verbs_aux on verbs(auxiliary);

-- ===============================================
-- LESSONS TABLE
-- ===============================================
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  level text,
  theme text,
  position int,                     -- ordering within level/theme
  description text,
  prerequisites text[],             -- array of lesson slugs
  exercises jsonb,                  -- array of exercise definitions
  created_at timestamptz default now()
);

-- ===============================================
-- USER PROGRESS (with RLS)
-- ===============================================
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  vocab_id text references vocabulary(id),
  verb_id text references verbs(id),
  -- SRS (SM-2) state
  ease_factor numeric default 2.5,
  interval_days int default 1,
  repetitions int default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz default now(),
  -- Stats
  correct_count int default 0,
  incorrect_count int default 0,
  -- Mastery state
  mastered boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_progress_user on user_progress(user_id);
create index if not exists idx_progress_review on user_progress(user_id, next_review_at);

-- Row-level security
alter table user_progress enable row level security;

create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on user_progress for delete
  using (auth.uid() = user_id);

-- ===============================================
-- USER PROFILE (XP, level, streak)
-- ===============================================
create table if not exists user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  current_level text default 'A1',
  total_xp int default 0,
  streak_days int default 0,
  last_activity_date date,
  hearts int default 5,
  hearts_refilled_at timestamptz,
  placement_test_completed boolean default false,
  placement_test_result text,
  preferences jsonb,                -- theme, sound, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profile enable row level security;

create policy "Users can view their own profile"
  on user_profile for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on user_profile for update
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on user_profile for insert
  with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profile (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();