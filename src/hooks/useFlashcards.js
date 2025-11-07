import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Fetch flashcards with automatic Firestore caching
 * The Firestore SDK automatically caches results in IndexedDB
 *
 * @param {string} level - Level ID (A1, A2, B1)
 * @param {object|string} [category] - Category object {id, name} or null (A1 only)
 * @param {string} [mode] - Mode (vocabulary or sentences, A1 only)
 * @returns {object} { data, loading, error, isOnline }
 */
export function useFlashcards(level, category = null, mode = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status for UI feedback
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Skip fetching if no level is selected
    if (!level) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;

    async function fetchFlashcards() {
      try {
        setLoading(true);
        setError(null);

        // Build Firestore query
        let constraints = [where('level_id', '==', level)];

        // Add category filter if provided (A1 only)
        // Use slug-based filtering since category IDs are UUIDs that can change between exports
        let categorySlug = null;
        if (category) {
          categorySlug = typeof category === 'object' ? category.slug : category;
          constraints.push(where('category_slug', '==', categorySlug));
        }

        // Add mode filter if provided
        if (mode) {
          constraints.push(where('mode', '==', mode));
        }

        console.log('[useFlashcards] Building query with constraints:', {
          level,
          categorySlug,
          mode,
          constraintCount: constraints.length
        });

        const q = query(collection(db, 'flashcards'), ...constraints);

        // Firestore SDK automatically uses cache when offline
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.warn(`[useFlashcards] No flashcards found for level=${level}, mode=${mode}`);
          throw new Error('No flashcards found');
        }

        // Sort by display_order (since we removed orderBy from query)
        const cards = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        // Shuffle cards using Fisher-Yates algorithm for random order
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        console.log(`[useFlashcards] Fetched and randomized ${cards.length} flashcards for level=${level}, categorySlug=${categorySlug}, mode=${mode}`);

        if (isMounted) {
          setData(cards);
          setLoading(false);
        }
      } catch (err) {
        console.error(`[useFlashcards] Error fetching flashcards for ${level}/${mode}:`, err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch flashcards');
          setLoading(false);
        }
      }
    }

    fetchFlashcards();

    return () => {
      isMounted = false;
    };
  }, [level, category, mode]);

  return { data, loading, error, isOnline };
}
