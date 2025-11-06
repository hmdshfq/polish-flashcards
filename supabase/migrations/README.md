# Database Migrations

This directory contains SQL migrations for the Polish Flashcards database.

## Migration 002: Rename 'grammar' to 'sentences'

This migration updates the flashcard mode from 'grammar' to 'sentences' to better reflect the content type.

### Option 1: Run via Script (Recommended)

If you have Node.js and your environment variables set up:

```bash
node scripts/migrate-grammar-to-sentences.js
```

This will:
- Update all flashcards with `mode='grammar'` to `mode='sentences'`
- Show you the SQL to run manually for the schema constraint update

### Option 2: Run Manually in Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `002_rename_grammar_to_sentences.sql`
4. Click "Run"

### Option 3: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

This will apply all pending migrations.

## What This Migration Does

1. **Updates existing data**: Changes all flashcards with `mode='grammar'` to `mode='sentences'`
2. **Updates schema constraint**: Modifies the CHECK constraint on the `mode` column to accept 'vocabulary' and 'sentences' instead of 'grammar'

## Verification

After running the migration, verify it worked by checking:

```sql
-- Check if any 'grammar' mode flashcards remain (should return 0)
SELECT COUNT(*) FROM flashcards WHERE mode = 'grammar';

-- Check that 'sentences' mode flashcards exist
SELECT COUNT(*) FROM flashcards WHERE mode = 'sentences';

-- Verify the constraint
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'flashcards' AND con.conname = 'flashcards_mode_check';
```

## Rollback

If you need to rollback this migration:

```sql
-- Rollback: Change 'sentences' back to 'grammar'
UPDATE flashcards SET mode = 'grammar' WHERE mode = 'sentences';

-- Restore original constraint
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_mode_check;
ALTER TABLE flashcards ADD CONSTRAINT flashcards_mode_check CHECK (mode IN ('vocabulary', 'grammar'));
```
