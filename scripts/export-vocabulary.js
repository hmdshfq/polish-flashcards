#!/usr/bin/env node
import { vocabulary } from '../src/data/vocabulary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, '..', 'export');

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateCard(card, level, category, mode) {
  const errors = [];
  if (!card.polish || typeof card.polish !== 'string') {
    errors.push('Missing or invalid polish text');
  }
  if (!card.english || typeof card.english !== 'string') {
    errors.push('Missing or invalid english text');
  }
  if (errors.length > 0) {
    console.error(`❌ Validation error in ${level}/${category}/${mode}:`, errors);
    console.error('   Card:', card);
    return false;
  }
  return true;
}

function exportVocabulary() {
  console.log('📤 Exporting vocabulary data...\n');

  const levels = [];
  const categories = [];
  const flashcards = [];

  // Track used slugs to prevent duplicates
  const usedSlugs = new Set();
  let validationErrors = 0;

  // Process each level
  Object.entries(vocabulary).forEach(([levelId, levelData], levelIndex) => {
    // Add level
    levels.push({
      id: levelId,
      name: levelId,
      display_order: levelIndex,
      has_categories: !Array.isArray(levelData),
      created_at: new Date().toISOString()
    });

    if (Array.isArray(levelData)) {
      // B1 style: flat array
      levelData.forEach((card, index) => {
        if (validateCard(card, levelId, 'none', 'vocabulary')) {
          flashcards.push({
            id: uuidv4(),
            level_id: levelId,
            category_id: null,
            category_slug: null,
            mode: 'vocabulary',
            polish: card.polish,
            english: card.english,
            display_order: index
          });
        } else {
          validationErrors++;
        }
      });
    } else {
      // A1/A2 style: categories with vocabulary/sentences
      Object.entries(levelData).forEach(([categoryName, categoryData], catIndex) => {
        const slug = slugify(categoryName);

        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (usedSlugs.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        usedSlugs.add(uniqueSlug);

        const categoryId = uuidv4();

        // Add category
        categories.push({
          id: categoryId,
          level_id: levelId,
          name: categoryName,
          slug: uniqueSlug,
          display_order: catIndex,
          created_at: new Date().toISOString()
        });

        // Add vocabulary cards
        if (categoryData.vocabulary) {
          categoryData.vocabulary.forEach((card, index) => {
            if (validateCard(card, levelId, categoryName, 'vocabulary')) {
              flashcards.push({
                id: uuidv4(),
                level_id: levelId,
                category_id: categoryId,
                category_slug: uniqueSlug,
                mode: 'vocabulary',
                polish: card.polish,
                english: card.english,
                display_order: index
              });
            } else {
              validationErrors++;
            }
          });
        }

        // Add sentence cards
        if (categoryData.sentences) {
          categoryData.sentences.forEach((card, index) => {
            if (validateCard(card, levelId, categoryName, 'sentences')) {
              flashcards.push({
                id: uuidv4(),
                level_id: levelId,
                category_id: categoryId,
                category_slug: uniqueSlug,
                mode: 'sentences',
                polish: card.polish,
                english: card.english,
                display_order: index
              });
            } else {
              validationErrors++;
            }
          });
        }
      });
    }
  });

  // Ensure export directory exists
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Write JSON files
  fs.writeFileSync(
    path.join(exportDir, 'levels.json'),
    JSON.stringify(levels, null, 2)
  );
  fs.writeFileSync(
    path.join(exportDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );
  fs.writeFileSync(
    path.join(exportDir, 'flashcards.json'),
    JSON.stringify(flashcards, null, 2)
  );

  if (validationErrors > 0) {
    console.error(`\n⚠️  Export completed with ${validationErrors} validation error(s)`);
    console.error('Please fix the errors above and try again.\n');
    process.exit(1);
  }

  console.log('✅ Export complete!\n');
  console.log(`Exported data:`);
  console.log(`  • Levels: ${levels.length}`);
  console.log(`  • Categories: ${categories.length}`);
  console.log(`  • Flashcards: ${flashcards.length}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review exported JSON files in export/`);
  console.log(`  2. Run: pnpm import`);
  console.log(`  3. Verify data in Firebase Console\n`);
}

exportVocabulary();
