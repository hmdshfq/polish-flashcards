-- Migration: Rename 'grammar' mode to 'sentences'
-- This updates existing flashcard data to use the new 'sentences' mode name

-- Update all flashcards with mode = 'grammar' to mode = 'sentences'
UPDATE flashcards
SET mode = 'sentences'
WHERE mode = 'grammar';

-- Drop the old check constraint if it exists
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_mode_check;

-- Add the new check constraint with 'sentences' instead of 'grammar'
ALTER TABLE flashcards
ADD CONSTRAINT flashcards_mode_check
CHECK (mode IN ('vocabulary', 'sentences'));
