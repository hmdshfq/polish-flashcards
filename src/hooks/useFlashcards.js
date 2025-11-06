import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  cacheFlashcards,
  getCachedFlashcardsByLevel,
  getCachedFlashcardsByCategory,
  getCachedFlashcardsByLevelAndMode,
  getCacheMetadata,
  setCacheMetadata,
  isCacheValid
} from '../services/indexedDB';
import { slugify } from '../utils/slugify';

/**
 * Fetch flashcards with offline-first caching
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

        // Convert category name to slug for consistency
        const categorySlug = category ? slugify(category) : null;
        const cacheKey = `flashcards:${level}:${categorySlug}:${mode}`;
        const metadata = await getCacheMetadata(cacheKey);
        let cards = null;

        // Try to use cache first
        if (isCacheValid(metadata)) {
          if (categorySlug) {
            // Get category ID from slug
            const categoryId = await getCategoriesIdBySlug(level, categorySlug);
            if (categoryId) {
              cards = await getCachedFlashcardsByCategory(categoryId);
              if (mode) {
                cards = cards.filter(c => c.mode === mode);
              }
            }
          } else if (mode) {
            cards = await getCachedFlashcardsByLevelAndMode(level, mode);
          } else {
            cards = await getCachedFlashcardsByLevel(level);
          }

          if (cards && cards.length > 0) {
            if (isMounted) {
              setData(cards);
              setLoading(false);
            }
            return;
          }
        }

        // Cache miss or invalid - fetch from Supabase
        let query = supabase
          .from('flashcards')
          .select('*')
          .eq('level_id', level)
          .order('display_order');

        if (categorySlug) {
          // Get category ID by level + slug
          const { data: categoryData, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('level_id', level)
            .eq('slug', categorySlug)
            .single();

          if (catError) {
            throw new Error(`Category not found: ${category} (slug: ${categorySlug})`);
          }

          query = query.eq('category_id', categoryData.id);
        } else {
          // A2/B1 - no category
          query = query.is('category_id', null);
        }

        if (mode) {
          query = query.eq('mode', mode);
        }

        const { data: fetchedCards, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (!fetchedCards || fetchedCards.length === 0) {
          throw new Error('No flashcards found');
        }

        // Cache the results
        await cacheFlashcards(fetchedCards);
        await setCacheMetadata(cacheKey, { timestamp: Date.now() });

        if (isMounted) {
          setData(fetchedCards);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch flashcards');
          setLoading(false);

          // Try to serve stale cache as fallback
          try {
            let cachedCards = null;
            const categorySlug = category ? slugify(category) : null;

            if (categorySlug) {
              const categoryId = await getCategoriesIdBySlug(level, categorySlug);
              if (categoryId) {
                cachedCards = await getCachedFlashcardsByCategory(categoryId);
                if (mode) {
                  cachedCards = cachedCards.filter(c => c.mode === mode);
                }
              }
            } else if (mode) {
              cachedCards = await getCachedFlashcardsByLevelAndMode(level, mode);
            } else {
              cachedCards = await getCachedFlashcardsByLevel(level);
            }

            if (cachedCards && cachedCards.length > 0) {
              setData(cachedCards);
              setError(null); // Clear error if we have stale cache
            }
          } catch (cacheErr) {
            console.error('No cache available:', cacheErr);
          }
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

/**
 * Helper to get category ID by level and slug
 * Tries cache first, then Supabase
 */
async function getCategoriesIdBySlug(levelId, slug) {
  try {
    // Try to get from Supabase with caching
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('level_id', levelId)
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data?.id;
  } catch (err) {
    console.error('Failed to get category ID:', err);
    return null;
  }
}
