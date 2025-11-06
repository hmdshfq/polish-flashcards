import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Fetch flashcard counts per category for a given level
 * Returns a map of category names to vocabulary word counts
 * Firestore SDK automatically caches the results
 *
 * @param {string} levelId - Level ID (A1, A2, B1)
 * @param {Array} categories - Array of category objects
 * @returns {object} { counts, loading, error }
 */
export function useCategoryCounts(levelId, categories) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!levelId || !categories || categories.length === 0) {
      setCounts({});
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchCounts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all flashcards for this level from Firestore
        // (Firestore SDK automatically uses cache when offline)
        const q = query(
          collection(db, 'flashcards'),
          where('level_id', '==', levelId)
        );

        const snapshot = await getDocs(q);
        const flashcards = snapshot.docs.map(doc => doc.data());

        console.log(`[useCategoryCounts] Fetched ${flashcards.length} flashcards for level ${levelId}`);

        // Count vocabulary flashcards per category
        const categoryCountMap = {};

        for (const category of categories) {
          const vocabularyCount = flashcards.filter(
            card => card.category_id === category.id && card.mode === 'vocabulary'
          ).length;
          categoryCountMap[category.name] = vocabularyCount;
        }

        if (isMounted) {
          setCounts(categoryCountMap);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch category counts');
          setLoading(false);

          // Set empty counts on error
          const emptyCountMap = {};
          for (const category of categories) {
            emptyCountMap[category.name] = 0;
          }
          setCounts(emptyCountMap);
        }
      }
    }

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, [levelId, categories]);

  return { counts, loading, error };
}
