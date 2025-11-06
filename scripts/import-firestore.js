#!/usr/bin/env node

/**
 * Import vocabulary data into Firestore
 * Usage: node scripts/import-firestore.js
 *
 * This script imports levels, categories, and flashcards from exported JSON files
 * into Firestore with proper structure and denormalization.
 *
 * Prerequisites:
 * - Have firebase-admin SDK installed
 * - Have a service account key file at ./serviceAccountKey.json
 *   (Download from Firebase Console → Project Settings → Service Accounts)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, '..', 'export');

// Check for service account key
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found');
  console.error(`\nPlease download your Firebase service account key:`);
  console.error(`  1. Go to Firebase Console → Project Settings → Service Accounts`);
  console.error(`  2. Click "Generate New Private Key"`);
  console.error(`  3. Save the JSON file as: ./serviceAccountKey.json`);
  console.error(`\n⚠️  IMPORTANT: Never commit this file to git!`);
  console.error(`   Add it to .gitignore: echo 'serviceAccountKey.json' >> .gitignore`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Helper to convert category name to slug
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function importData() {
  try {
    console.log('📤 Importing data into Firestore...\n');

    // Read exported data
    const levelsData = JSON.parse(fs.readFileSync(path.join(exportDir, 'levels.json'), 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(path.join(exportDir, 'categories.json'), 'utf8'));
    const flashcardsData = JSON.parse(fs.readFileSync(path.join(exportDir, 'flashcards.json'), 'utf8'));

    // Create a map of category IDs to slugs for denormalization
    const categoryMap = {};
    categoriesData.forEach(cat => {
      categoryMap[cat.id] = cat.slug || slugify(cat.name);
    });

    // Import levels
    console.log('  Importing levels...');
    let levelCount = 0;
    for (const level of levelsData) {
      await db.collection('levels').doc(level.id).set({
        name: level.name,
        description: level.description || '',
        display_order: level.display_order,
        has_categories: level.has_categories || false
      }, { merge: true });
      levelCount++;
    }
    console.log(`    ✓ Imported ${levelCount} levels`);

    // Import categories
    console.log('  Importing categories...');
    let categoryCount = 0;
    for (const category of categoriesData) {
      await db.collection('categories').doc(category.id).set({
        level_id: category.level_id,
        name: category.name,
        slug: category.slug || slugify(category.name),
        description: category.description || '',
        display_order: category.display_order
      }, { merge: true });
      categoryCount++;
    }
    console.log(`    ✓ Imported ${categoryCount} categories`);

    // Import flashcards with denormalized category_slug
    console.log('  Importing flashcards...');
    let flashcardCount = 0;
    for (const flashcard of flashcardsData) {
      await db.collection('flashcards').doc(flashcard.id).set({
        level_id: flashcard.level_id,
        category_id: flashcard.category_id || null,
        // Denormalize category_slug for efficient querying
        category_slug: flashcard.category_id ? categoryMap[flashcard.category_id] : null,
        mode: flashcard.mode || 'vocabulary',
        polish: flashcard.polish,
        english: flashcard.english,
        display_order: flashcard.display_order
      }, { merge: true });
      flashcardCount++;
    }
    console.log(`    ✓ Imported ${flashcardCount} flashcards`);

    console.log('\n✅ Import complete!');
    console.log(`\nData imported to Firestore:`);
    console.log(`  • Levels: ${levelCount}`);
    console.log(`  • Categories: ${categoryCount}`);
    console.log(`  • Flashcards: ${flashcardCount}`);

    console.log(`\n⚠️  Next steps:`);
    console.log(`  1. Verify data in Firebase Console`);
    console.log(`  2. Create composite indexes (Firestore will suggest them)`);
    console.log(`  3. Deploy Security Rules: firestore.rules`);
    console.log(`  4. 🔒 Delete serviceAccountKey.json - NEVER commit it!`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  • Ensure serviceAccountKey.json exists in the project root');
    console.error('  • Check that Firestore is enabled in your Firebase project');
    process.exit(1);
  }
}

importData().then(() => process.exit(0));
