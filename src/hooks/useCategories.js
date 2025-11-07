import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Fetch categories for a specific level with automatic Firestore caching
 * The Firestore SDK automatically caches results in IndexedDB
 *
 * @param {string} levelId - Level ID (A1, A2, B1)
 * @returns {object} { data, loading, error }
 */
export function useCategories(levelId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!levelId) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        // Query categories for the specified level
        // Note: Firestore may need a composite index for where + orderBy
        // If this fails, categories will be sorted in the component
        const q = query(
          collection(db, 'categories'),
          where('level_id', '==', levelId)
        );

        const snapshot = await getDocs(q);

        console.log(`[useCategories] Fetched ${snapshot.docs.length} categories for level ${levelId}`);

        const categories = snapshot.docs.map(doc => ({
          id: doc.id,  // Use Firestore document ID as category ID (matches flashcard.category_id)
          ...doc.data()
        }));

        if (isMounted) {
          setData(categories);
          setLoading(false);
        }
      } catch (err) {
        console.error(`[useCategories] Error fetching categories for ${levelId}:`, err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch categories');
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [levelId]);

  return { data, loading, error };
}
