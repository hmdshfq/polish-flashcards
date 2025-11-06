#!/usr/bin/env node

/**
 * Data Migration Script: Update 'grammar' mode to 'sentences'
 *
 * This script updates all flashcards with mode='grammar' to mode='sentences'
 * Run this once after deploying the code changes.
 *
 * Usage:
 *   node scripts/migrate-grammar-to-sentences.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateData() {
  try {
    console.log('Starting migration: grammar → sentences');
    console.log('=====================================\n');

    // First, check how many records need to be updated
    const { count, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('mode', 'grammar');

    if (countError) {
      throw countError;
    }

    console.log(`Found ${count} flashcards with mode='grammar'`);

    if (count === 0) {
      console.log('✓ No migration needed - all flashcards already use correct mode');
      return;
    }

    // Update all flashcards with mode='grammar' to mode='sentences'
    console.log('\nUpdating flashcards...');
    const { data, error: updateError } = await supabase
      .from('flashcards')
      .update({ mode: 'sentences' })
      .eq('mode', 'grammar')
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log(`✓ Successfully updated ${data.length} flashcards`);
    console.log('\nMigration completed successfully! 🎉');
    console.log('\nNote: You may need to manually update the database check constraint.');
    console.log('Run this SQL in the Supabase SQL Editor:');
    console.log(`
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_mode_check;
ALTER TABLE flashcards ADD CONSTRAINT flashcards_mode_check CHECK (mode IN ('vocabulary', 'sentences'));
    `);

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

migrateData();
