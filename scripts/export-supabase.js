#!/usr/bin/env node

/**
 * Export vocabulary data from Supabase
 * Usage: node scripts/export-supabase.js
 *
 * This script exports levels, categories, and flashcards from Supabase
 * and saves them to JSON files for import into Firestore.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, '..', 'export');

// Ensure export directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAdd these to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportData() {
  try {
    console.log('📥 Exporting data from Supabase...\n');

    // Export levels
    console.log('  Exporting levels...');
    const { data: levels, error: levelsError } = await supabase
      .from('levels')
      .select('*')
      .order('display_order');

    if (levelsError) throw levelsError;
    console.log(`    ✓ Found ${levels.length} levels`);

    // Export categories
    console.log('  Exporting categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (categoriesError) throw categoriesError;
    console.log(`    ✓ Found ${categories.length} categories`);

    // Export flashcards
    console.log('  Exporting flashcards...');
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .order('display_order');

    if (flashcardsError) throw flashcardsError;
    console.log(`    ✓ Found ${flashcards.length} flashcards`);

    // Save to JSON files
    console.log('\n📁 Saving to JSON files...');

    fs.writeFileSync(
      path.join(exportDir, 'levels.json'),
      JSON.stringify(levels, null, 2)
    );
    console.log(`    ✓ Saved: export/levels.json`);

    fs.writeFileSync(
      path.join(exportDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    console.log(`    ✓ Saved: export/categories.json`);

    fs.writeFileSync(
      path.join(exportDir, 'flashcards.json'),
      JSON.stringify(flashcards, null, 2)
    );
    console.log(`    ✓ Saved: export/flashcards.json`);

    console.log('\n✅ Export complete!');
    console.log(`\nData summary:`);
    console.log(`  • Levels: ${levels.length}`);
    console.log(`  • Categories: ${categories.length}`);
    console.log(`  • Flashcards: ${flashcards.length}`);
    console.log(`\nNext step: Run 'node scripts/import-firestore.js' to import into Firestore`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportData();
