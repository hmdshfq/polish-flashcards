import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Fetch all available levels with automatic Firestore caching
 * The Firestore SDK automatically caches results in IndexedDB
 *
 * @returns {object} { data, loading, error }
 */
export function useLevels() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLevels() {
      try {
        setLoading(true);
        setError(null);

        // Query levels from Firestore (SDK automatically uses cache when offline)
        const q = query(collection(db, 'levels'));

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          throw new Error('No levels found');
        }

        // Sort by display_order
        const levels = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        console.log(`[useLevels] Fetched ${levels.length} levels:`, levels.map(l => l.id));

        if (isMounted) {
          setData(levels);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch levels');
          setLoading(false);
        }
      }
    }

    fetchLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
