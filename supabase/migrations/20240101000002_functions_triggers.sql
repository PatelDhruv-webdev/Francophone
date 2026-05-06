-- Functions and triggers

-- ── Auto-create profile on auth.users insert ─────────────────────────────────
-- This runs server-side in Supabase, so the profile always exists after signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Auto-update profiles.updated_at ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Seed static reference data ───────────────────────────────────────────────

INSERT INTO public.levels (code, title, description, order_index) VALUES
  ('A1', 'Beginner',           'Basic phrases and everyday expressions',         1),
  ('A2', 'Elementary',         'Simple sentences on familiar topics',            2),
  ('B1', 'Intermediate',       'Main points of clear standard input',            3),
  ('B2', 'Upper Intermediate', 'Complex texts and abstract topics',              4),
  ('C1', 'Advanced',           'Demanding texts with implicit meaning',          5),
  ('C2', 'Mastery',            'Everything you understand and express with ease', 6)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.achievements (slug, title, description, icon, xp_reward) VALUES
  ('first-steps',     'First Steps',      'Complete your first lesson',              'Star',       10),
  ('word-collector',  'Word Collector',   'Learn 100 French words',                  'BookOpen',   50),
  ('word-hoarder',    'Word Hoarder',     'Learn 500 French words',                  'Library',    100),
  ('polyglot',        'Polyglot',         'Learn 1000 French words',                 'Globe',      200),
  ('week-warrior',    'Week Warrior',     'Maintain a 7-day streak',                 'Flame',      50),
  ('monthly-master',  'Monthly Master',   'Maintain a 30-day streak',                'Trophy',     200),
  ('grammar-guru',    'Grammar Guru',     'Pass all A1 grammar topics',              'PenLine',    100),
  ('bookworm',        'Bookworm',         'Read 10 French texts',                    'BookMarked', 75),
  ('wordsmith',       'Wordsmith',        'Submit 5 writing pieces',                 'Edit',       75),
  ('speak-up',        'Speak Up',         'Complete 50 speaking exercises',          'Mic',        100),
  ('a1-graduate',     'A1 Graduate',      'Pass the A1 final test',                  'GraduationCap', 250),
  ('a2-graduate',     'A2 Graduate',      'Pass the A2 final test',                  'GraduationCap', 250),
  ('b1-graduate',     'B1 Graduate',      'Pass the B1 final test',                  'GraduationCap', 300),
  ('b2-graduate',     'B2 Graduate',      'Pass the B2 final test',                  'GraduationCap', 300),
  ('c1-graduate',     'C1 Graduate',      'Pass the C1 final test',                  'GraduationCap', 400),
  ('c2-graduate',     'C2 Graduate',      'Achieve French mastery — C2 complete',    'Medal',      500)
ON CONFLICT (slug) DO NOTHING;
