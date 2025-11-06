#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs SQL migrations against the Supabase database
 *
 * Usage:
 *   node scripts/run-migration.js supabase/migrations/002_rename_grammar_to_sentences.sql
 *
 * Note: Requires VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filePath) {
  try {
    console.log(`Reading migration file: ${filePath}`);
    const sql = readFileSync(filePath, 'utf8');

    console.log('Executing migration...');
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql RPC doesn't exist, try running commands individually
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('Running migration commands individually...');

        // Split SQL into individual statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('--'));

        for (const statement of statements) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec', { sql: statement });

          if (stmtError) {
            throw stmtError;
          }
        }
      } else {
        throw error;
      }
    }

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    console.error('\nPlease run this SQL manually in the Supabase SQL Editor:');
    console.error('\n' + readFileSync(filePath, 'utf8'));
    process.exit(1);
  }
}

// Get migration file path from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file>');
  console.error('Example: node scripts/run-migration.js supabase/migrations/002_rename_grammar_to_sentences.sql');
  process.exit(1);
}

runMigration(migrationFile);
