-- Create LEVELS table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL UNIQUE,
  has_categories BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CATEGORIES table (for A1 only)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id TEXT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level_id, slug)
);

-- Create FLASHCARDS table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id TEXT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  mode TEXT CHECK (mode IN ('vocabulary', 'grammar')),
  polish TEXT NOT NULL,
  english TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create USER_PROGRESS table (for spaced repetition)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  last_reviewed_at TIMESTAMPTZ NOT NULL,
  review_count INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(level_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_mode ON flashcards(mode);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_next_review ON user_progress(next_review_at);

-- Enable Row Level Security
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access to levels
CREATE POLICY "Public read access - levels"
  ON levels
  FOR SELECT
  USING (true);

-- RLS Policy: Public read access to categories
CREATE POLICY "Public read access - categories"
  ON categories
  FOR SELECT
  USING (true);

-- RLS Policy: Public read access to flashcards
CREATE POLICY "Public read access - flashcards"
  ON flashcards
  FOR SELECT
  USING (true);

-- RLS Policies for user_progress (private)
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
