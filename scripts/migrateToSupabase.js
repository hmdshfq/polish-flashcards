#!/usr/bin/env node

/**
 * Migration script to move vocabulary data from vocabulary.js to Supabase
 *
 * Usage: node scripts/migrateToSupabase.js
 *
 * Required environment variables:
 *   VITE_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (for migrations only, not used in app)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { vocabulary } from '../src/data/vocabulary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please set:');
  console.error('  VITE_SUPABASE_URL - Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY - Found in Supabase dashboard under Settings → API');
  process.exit(1);
}

// Create Supabase client with service role key for migrations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('📋 Running database migrations...');

  const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    const { error } = await supabase.rpc('exec', { sql });
    if (error) {
      // exec might not be available, try running statements individually
      console.log('⚠️  Could not run SQL directly, attempting alternative approach...');
      console.log('ℹ️  You can run the SQL manually in Supabase dashboard: Settings → SQL Editor → Create new query');
      return false;
    }
    console.log('✅ Migrations completed');
    return true;
  } catch (err) {
    console.log('⚠️  Migration via RPC failed. Running manual setup...');
    return false;
  }
}

async function migrateData() {
  console.log('\n📤 Starting data migration...\n');

  try {
    // 1. Insert levels
    console.log('→ Inserting levels...');
    const levels = [
      { id: 'A1', name: 'A1', display_order: 1, has_categories: true },
      { id: 'A2', name: 'A2', display_order: 2, has_categories: true },
      { id: 'B1', name: 'B1', display_order: 3, has_categories: false }
    ];

    const { error: levelsError } = await supabase
      .from('levels')
      .insert(levels);

    if (levelsError) {
      console.warn('⚠️  Levels may already exist:', levelsError.message);
    } else {
      console.log('  ✓ Inserted 3 levels');
    }

    // 2. Insert A1 and A2 categories
    console.log('→ Inserting categories...');
    const a1Categories = Object.keys(vocabulary.A1);
    const a2Categories = Object.keys(vocabulary.A2);
    const categoryMap = {};

    // A1 categories
    for (let idx = 0; idx < a1Categories.length; idx++) {
      const catName = a1Categories[idx];
      const { data, error } = await supabase
        .from('categories')
        .insert({
          level_id: 'A1',
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          display_order: idx
        })
        .select()
        .single();

      if (error) {
        console.warn(`  ⚠️  Could not insert A1 category ${catName}:`, error.message);
      } else {
        categoryMap[`A1:${catName}`] = data.id;
        console.log(`  ✓ A1 - ${catName}`);
      }
    }

    // A2 categories
    for (let idx = 0; idx < a2Categories.length; idx++) {
      const catName = a2Categories[idx];
      const { data, error } = await supabase
        .from('categories')
        .insert({
          level_id: 'A2',
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          display_order: idx
        })
        .select()
        .single();

      if (error) {
        console.warn(`  ⚠️  Could not insert A2 category ${catName}:`, error.message);
      } else {
        categoryMap[`A2:${catName}`] = data.id;
        console.log(`  ✓ A2 - ${catName}`);
      }
    }

    // 3. Insert flashcards
    console.log('→ Inserting flashcards...');

    let totalCards = 0;
    const flashcards = [];

    // A1 flashcards (with categories and modes)
    for (const [category, modes] of Object.entries(vocabulary.A1)) {
      for (const [mode, cards] of Object.entries(modes)) {
        for (let idx = 0; idx < cards.length; idx++) {
          const card = cards[idx];
          flashcards.push({
            level_id: 'A1',
            category_id: categoryMap[`A1:${category}`],
            mode: mode,
            polish: card.polish,
            english: card.english,
            display_order: idx
          });
          totalCards++;
        }
      }
    }

    // A2 flashcards (with categories and modes)
    for (const [category, modes] of Object.entries(vocabulary.A2)) {
      for (const [mode, cards] of Object.entries(modes)) {
        for (let idx = 0; idx < cards.length; idx++) {
          const card = cards[idx];
          flashcards.push({
            level_id: 'A2',
            category_id: categoryMap[`A2:${category}`],
            mode: mode,
            polish: card.polish,
            english: card.english,
            display_order: idx
          });
          totalCards++;
        }
      }
    }

    // B1 flashcards (flat, no categories)
    for (let idx = 0; idx < vocabulary.B1.length; idx++) {
      const card = vocabulary.B1[idx];
      flashcards.push({
        level_id: 'B1',
        category_id: null,
        mode: null,
        polish: card.polish,
        english: card.english,
        display_order: idx
      });
      totalCards++;
    }

    // Batch insert in chunks (Supabase supports up to 1000 rows per request)
    const chunkSize = 1000;
    for (let i = 0; i < flashcards.length; i += chunkSize) {
      const chunk = flashcards.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('flashcards')
        .insert(chunk);

      if (error) {
        console.error(`  ❌ Error inserting flashcards (chunk ${Math.floor(i / chunkSize) + 1}):`, error.message);
        throw error;
      }
    }

    console.log(`  ✓ Inserted ${totalCards} flashcards`);

    console.log('\n✅ Migration complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Levels: 3`);
    console.log(`   • Categories: A1 (${a1Categories.length}) + A2 (${a2Categories.length}) = ${Object.keys(categoryMap).length} total`);
    console.log(`   • Flashcards: ${totalCards}`);
    console.log('\nYour data is now in Supabase! 🎉');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify SUPABASE_SERVICE_ROLE_KEY is correct');
    console.error('2. Ensure the SQL schema has been created (run migration SQL first)');
    console.error('3. Check that your Supabase project is active');
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Polish Flashcards → Supabase Migration\n');
  console.log(`📍 Target: ${supabaseUrl}\n`);

  // Try running migrations, but continue if they fail
  await runMigrations();

  // Run data migration
  await migrateData();
}

main();
