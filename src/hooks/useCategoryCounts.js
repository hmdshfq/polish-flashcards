import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { getCachedFlashcardsByLevel } from '../services/indexedDB';

/**
 * Fetch flashcard counts per category for a given level
 * Returns a map of category names to vocabulary word counts
 *
 * @param {string} levelId - Level ID (A1, A2, B1)
 * @param {Array} categories - Array of category objects
 * @returns {object} { counts, loading, error }
 */
export function useCategoryCounts(levelId, categories) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a stable dependency based on category IDs to prevent unnecessary re-fetches
  const categoryIds = useMemo(() => {
    if (!categories || categories.length === 0) return '';
    return categories.map(cat => cat.id).sort().join(',');
  }, [categories]);

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

        // Try to get from cache first
        const cachedFlashcards = await getCachedFlashcardsByLevel(levelId);

        if (cachedFlashcards && cachedFlashcards.length > 0) {
          // Count from cache
          const categoryCountMap = {};

          for (const category of categories) {
            const vocabularyCount = cachedFlashcards.filter(
              card => card.category_id === category.id && card.mode === 'vocabulary'
            ).length;
            categoryCountMap[category.name] = vocabularyCount;
          }

          if (isMounted) {
            setCounts(categoryCountMap);
            setLoading(false);
          }
          return;
        }

        // Fetch from Supabase if cache is empty
        const { data: flashcards, error: fetchError } = await supabase
          .from('flashcards')
          .select('category_id, mode')
          .eq('level_id', levelId);

        if (fetchError) throw fetchError;

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
  }, [levelId, categoryIds, categories]);

  return { counts, loading, error };
}
