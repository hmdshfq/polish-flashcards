import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Fetch flashcards with automatic Firestore caching
 * The Firestore SDK automatically caches results in IndexedDB
 *
 * @param {string} level - Level ID (A1, A2, B1)
 * @param {string} [category] - Category slug (A1 only)
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
    let isMounted = true;

    async function fetchFlashcards() {
      try {
        setLoading(true);
        setError(null);

        // Build Firestore query
        // Note: Categories in the UI are for organization only
        // Actual flashcards are filtered by level and mode only
        let constraints = [where('level_id', '==', level)];

        // Add mode filter if provided
        if (mode) {
          constraints.push(where('mode', '==', mode));
        }

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

        console.log(`[useFlashcards] Fetched ${cards.length} flashcards for level=${level}, mode=${mode}`);

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
