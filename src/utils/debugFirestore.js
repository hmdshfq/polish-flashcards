/**
 * Firestore Database Inspector
 *
 * Usage in browser console:
 * import { inspectDatabase } from './utils/debugFirestore.js'
 * await inspectDatabase()
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export async function inspectDatabase() {
  console.log('🔍 Inspecting Firestore database...\n');

  try {
    // Check Levels
    console.log('📚 Levels Collection:');
    const levelsSnap = await getDocs(collection(db, 'levels'));
    console.log(`  Count: ${levelsSnap.size}`);
    levelsSnap.docs.slice(0, 3).forEach(doc => {
      console.log(`  - ${doc.id}:`, doc.data());
    });

    // Check Categories
    console.log('\n🏷️ Categories Collection:');
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    console.log(`  Count: ${categoriesSnap.size}`);
    categoriesSnap.docs.slice(0, 5).forEach(doc => {
      console.log(`  - ${doc.id}:`, doc.data());
    });

    // Check Flashcards
    console.log('\n🎴 Flashcards Collection:');
    const flashcardsSnap = await getDocs(collection(db, 'flashcards'));
    console.log(`  Count: ${flashcardsSnap.size}`);
    if (flashcardsSnap.size > 0) {
      flashcardsSnap.docs.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.id}:`, doc.data());
      });
    } else {
      console.log('  ⚠️  No flashcards found!');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  Levels: ${levelsSnap.size}`);
    console.log(`  Categories: ${categoriesSnap.size}`);
    console.log(`  Flashcards: ${flashcardsSnap.size}`);

    if (flashcardsSnap.size === 0) {
      console.log('\n⚠️  ISSUE: Flashcards collection is empty!');
      console.log('  → Did you run: node scripts/import-firestore.js');
    }

    return {
      levelsCount: levelsSnap.size,
      categoriesCount: categoriesSnap.size,
      flashcardsCount: flashcardsSnap.size
    };
  } catch (error) {
    console.error('❌ Error inspecting database:', error);
  }
}
