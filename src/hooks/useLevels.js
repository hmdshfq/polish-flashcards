import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  cacheLevels,
  getCachedLevels,
  getCacheMetadata,
  setCacheMetadata,
  isCacheValid
} from '../services/indexedDB';

/**
 * Fetch all available levels with caching
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

        const cacheKey = 'levels';
        const metadata = await getCacheMetadata(cacheKey);

        // Check cache first
        if (isCacheValid(metadata)) {
          const cached = await getCachedLevels();
          if (cached && cached.length > 0) {
            if (isMounted) {
              setData(cached);
              setLoading(false);
            }
            return;
          }
        }

        // Fetch from Supabase
        const { data: levels, error: fetchError } = await supabase
          .from('levels')
          .select('*')
          .order('display_order');

        if (fetchError) throw fetchError;
        if (!levels || levels.length === 0) throw new Error('No levels found');

        // Cache the results
        await cacheLevels(levels);
        await setCacheMetadata(cacheKey, { timestamp: Date.now() });

        if (isMounted) {
          setData(levels);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch levels');
          setLoading(false);

          // Try stale cache as fallback
          try {
            const cached = await getCachedLevels();
            if (cached && cached.length > 0) {
              setData(cached);
              setError(null);
            }
          } catch (cacheErr) {
            console.error('No cache available:', cacheErr);
          }
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
