import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  cacheCategories,
  getCachedCategoriesByLevel,
  getCacheMetadata,
  setCacheMetadata,
  isCacheValid
} from '../services/indexedDB';

/**
 * Fetch categories for a specific level with caching
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

        const cacheKey = `categories:${levelId}`;
        const metadata = await getCacheMetadata(cacheKey);

        // Check cache first
        if (isCacheValid(metadata)) {
          const cached = await getCachedCategoriesByLevel(levelId);
          if (cached && cached.length > 0) {
            if (isMounted) {
              setData(cached);
              setLoading(false);
            }
            return;
          }
        }

        // Fetch from Supabase
        const { data: categories, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .eq('level_id', levelId)
          .order('display_order');

        if (fetchError) throw fetchError;

        // It's ok if there are no categories (A2, B1 levels)
        if (!categories) {
          if (isMounted) {
            setData([]);
            setLoading(false);
          }
          return;
        }

        // Cache the results
        if (categories.length > 0) {
          await cacheCategories(categories);
          await setCacheMetadata(cacheKey, { timestamp: Date.now() });
        }

        if (isMounted) {
          setData(categories);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch categories');
          setLoading(false);

          // Try stale cache as fallback
          try {
            const cached = await getCachedCategoriesByLevel(levelId);
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

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [levelId]);

  return { data, loading, error };
}
