#!/usr/bin/env node

/**
 * Clear Firestore collections (for development/testing only)
 * This deletes all documents from specified collections
 *
 * Usage: node scripts/clear-firestore.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check for service account key
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at', serviceAccountPath);
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

async function clearCollections() {
  try {
    console.log('🗑️  Clearing Firestore collections...\n');

    const collections = ['flashcards', 'categories', 'levels'];

    for (const collectionName of collections) {
      console.log(`  Clearing ${collectionName}...`);
      const docs = await db.collection(collectionName).get();

      let deletedCount = 0;
      for (const doc of docs.docs) {
        await doc.ref.delete();
        deletedCount++;
      }

      console.log(`    ✓ Deleted ${deletedCount} documents`);
    }

    console.log('\n✅ Clear complete!');
    console.log('\nNext: run "node scripts/import-firestore.js" to re-import data');

  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

clearCollections().then(() => process.exit(0));
