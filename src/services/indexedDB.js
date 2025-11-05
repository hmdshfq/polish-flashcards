import { openDB } from 'idb';

const DB_NAME = 'PolishFlashcards';
const DB_VERSION = 1;

// Store names
const STORES = {
  LEVELS: 'levels',
  CATEGORIES: 'categories',
  FLASHCARDS: 'flashcards',
  USER_PROGRESS: 'user_progress',
  SYNC_QUEUE: 'sync_queue' // For offline progress updates
};

/**
 * Initialize the IndexedDB database
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Levels store
      if (!db.objectStoreNames.contains(STORES.LEVELS)) {
        db.createObjectStore(STORES.LEVELS, { keyPath: 'id' });
      }

      // Categories store
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoryStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
        categoryStore.createIndex('level_id', 'level_id');
      }

      // Flashcards store
      if (!db.objectStoreNames.contains(STORES.FLASHCARDS)) {
        const cardStore = db.createObjectStore(STORES.FLASHCARDS, { keyPath: 'id' });
        cardStore.createIndex('level_id', 'level_id');
        cardStore.createIndex('category_id', 'category_id');
        cardStore.createIndex('mode', 'mode');
      }

      // User progress store
      if (!db.objectStoreNames.contains(STORES.USER_PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.USER_PROGRESS, { keyPath: 'id' });
        progressStore.createIndex('user_id', 'user_id');
        progressStore.createIndex('flashcard_id', 'flashcard_id');
        progressStore.createIndex('next_review_at', 'next_review_at');
      }

      // Sync queue for offline progress updates
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

/**
 * Cache levels in IndexedDB
 */
export async function cacheLevels(levels) {
  const db = await getDB();
  const tx = db.transaction(STORES.LEVELS, 'readwrite');

  // Clear old data
  await tx.store.clear();

  // Add new data
  for (const level of levels) {
    await tx.store.add(level);
  }

  await tx.done;
}

/**
 * Get cached levels
 */
export async function getCachedLevels() {
  const db = await getDB();
  return db.getAll(STORES.LEVELS);
}

/**
 * Cache categories in IndexedDB
 */
export async function cacheCategories(categories) {
  const db = await getDB();
  const tx = db.transaction(STORES.CATEGORIES, 'readwrite');

  // Only add if not already cached
  for (const category of categories) {
    const existing = await tx.store.get(category.id);
    if (!existing) {
      await tx.store.add(category);
    }
  }

  await tx.done;
}

/**
 * Get cached categories for a level
 */
export async function getCachedCategoriesByLevel(levelId) {
  const db = await getDB();
  return db.getAllFromIndex(STORES.CATEGORIES, 'level_id', levelId);
}

/**
 * Cache flashcards in IndexedDB
 */
export async function cacheFlashcards(flashcards) {
  const db = await getDB();
  const tx = db.transaction(STORES.FLASHCARDS, 'readwrite');

  // Only add if not already cached (to preserve order)
  for (const card of flashcards) {
    const existing = await tx.store.get(card.id);
    if (!existing) {
      await tx.store.add(card);
    }
  }

  await tx.done;
}

/**
 * Get cached flashcards by level
 */
export async function getCachedFlashcardsByLevel(levelId) {
  const db = await getDB();
  return db.getAllFromIndex(STORES.FLASHCARDS, 'level_id', levelId);
}

/**
 * Get cached flashcards by category
 */
export async function getCachedFlashcardsByCategory(categoryId) {
  const db = await getDB();
  return db.getAllFromIndex(STORES.FLASHCARDS, 'category_id', categoryId);
}

/**
 * Get cached flashcards by level and mode
 */
export async function getCachedFlashcardsByLevelAndMode(levelId, mode) {
  const db = await getDB();
  const allCards = await db.getAllFromIndex(STORES.FLASHCARDS, 'level_id', levelId);
  return allCards.filter(card => card.mode === mode);
}

/**
 * Cache user progress
 */
export async function cacheUserProgress(progress) {
  const db = await getDB();
  const tx = db.transaction(STORES.USER_PROGRESS, 'readwrite');

  for (const item of progress) {
    // Check if exists and update or insert
    const existing = await tx.store.get(item.id);
    if (existing) {
      await tx.store.put(item);
    } else {
      await tx.store.add(item);
    }
  }

  await tx.done;
}

/**
 * Get cached progress for user
 */
export async function getCachedUserProgress(userId) {
  const db = await getDB();
  return db.getAllFromIndex(STORES.USER_PROGRESS, 'user_id', userId);
}

/**
 * Add progress update to sync queue (for offline support)
 */
export async function queueProgressUpdate(update) {
  const db = await getDB();
  return db.add(STORES.SYNC_QUEUE, {
    ...update,
    queued_at: new Date().toISOString(),
    synced: false
  });
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncQueue() {
  const db = await getDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
  const allItems = await tx.store.getAll();
  return allItems.filter(item => !item.synced);
}

/**
 * Mark sync queue item as synced
 */
export async function markSyncedInQueue(id) {
  const db = await getDB();
  const item = await db.get(STORES.SYNC_QUEUE, id);
  if (item) {
    item.synced = true;
    await db.put(STORES.SYNC_QUEUE, item);
  }
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue() {
  const db = await getDB();
  await db.clear(STORES.SYNC_QUEUE);
}

/**
 * Get cache metadata (for TTL checking)
 */
export async function getCacheMetadata(key) {
  // Store metadata in a special location
  // For now, we'll use localStorage for simplicity
  const cached = localStorage.getItem(`cache-meta:${key}`);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Set cache metadata
 */
export async function setCacheMetadata(key, metadata) {
  localStorage.setItem(`cache-meta:${key}`, JSON.stringify(metadata));
}

/**
 * Check if cache is still valid (24 hour TTL)
 */
export function isCacheValid(metadata) {
  if (!metadata || !metadata.timestamp) return false;
  const age = Date.now() - metadata.timestamp;
  const TTL = 24 * 60 * 60 * 1000; // 24 hours
  return age < TTL;
}

/**
 * Clear all IndexedDB data
 */
export async function clearAllCache() {
  const db = await getDB();
  const stores = Object.values(STORES);
  for (const store of stores) {
    await db.clear(store);
  }
  // Also clear localStorage metadata
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith('cache-meta:')) {
      localStorage.removeItem(key);
    }
  }
}
