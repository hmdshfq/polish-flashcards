import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import {
  cacheUserProgress,
  getCachedUserProgress,
  queueProgressUpdate,
  getPendingSyncQueue,
  markSyncedInQueue,
  getCacheMetadata,
  setCacheMetadata,
  isCacheValid
} from '../services/indexedDB';
import { calculateNextReview } from '../utils/spacedRepetition';

/**
 * Hook for managing user progress with offline support
 * Handles spaced repetition scheduling and progress tracking
 *
 * @param {string} userId - The user ID
 * @returns {object} { progress, loading, error, updateProgress, syncProgress }
 */
export function useUserProgress(userId) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch user progress
  useEffect(() => {
    if (!userId) {
      setProgress({});
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProgress() {
      try {
        setLoading(true);
        setError(null);

        const cacheKey = `progress:${userId}`;
        const metadata = await getCacheMetadata(cacheKey);

        // Check cache first
        if (isCacheValid(metadata)) {
          const cached = await getCachedUserProgress(userId);
          if (cached && cached.length > 0) {
            const progressMap = {};
            for (const item of cached) {
              progressMap[item.flashcard_id] = item;
            }
            if (isMounted) {
              setProgress(progressMap);
              setLoading(false);
            }
            return;
          }
        }

        // Fetch from Supabase (only if online)
        if (navigator.onLine) {
          const { data: userProgress, error: fetchError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);

          if (fetchError) throw fetchError;

          // Cache the results
          if (userProgress && userProgress.length > 0) {
            await cacheUserProgress(userProgress);
            await setCacheMetadata(cacheKey, { timestamp: Date.now() });

            const progressMap = {};
            for (const item of userProgress) {
              progressMap[item.flashcard_id] = item;
            }

            if (isMounted) {
              setProgress(progressMap);
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch progress');
          setLoading(false);

          // Try stale cache as fallback
          try {
            const cached = await getCachedUserProgress(userId);
            if (cached && cached.length > 0) {
              const progressMap = {};
              for (const item of cached) {
                progressMap[item.flashcard_id] = item;
              }
              setProgress(progressMap);
              setError(null);
            }
          } catch (cacheErr) {
            console.error('No cache available:', cacheErr);
          }
        }
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  /**
   * Update progress for a flashcard
   * Implements SM-2 spaced repetition algorithm
   */
  const updateProgress = useCallback(
    async (flashcardId, quality) => {
      if (!userId) {
        console.error('User ID required to update progress');
        return null;
      }

      try {
        const now = new Date();
        const existingProgress = progress[flashcardId];

        let newProgress;
        if (existingProgress) {
          // Update existing progress
          newProgress = {
            ...existingProgress,
            review_count: (existingProgress.review_count || 1) + 1,
            last_reviewed_at: now.toISOString(),
            ease_factor: Math.max(
              1.3,
              existingProgress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            ),
            next_review_at: calculateNextReview(
              existingProgress.ease_factor,
              existingProgress.review_count + 1
            ),
            updated_at: now.toISOString()
          };
        } else {
          // Create new progress entry
          newProgress = {
            user_id: userId,
            flashcard_id: flashcardId,
            review_count: 1,
            last_reviewed_at: now.toISOString(),
            ease_factor: 2.5,
            next_review_at: calculateNextReview(2.5, 1),
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          };
        }

        // If online, sync immediately
        if (navigator.onLine) {
          const { data, error: upsertError } = await supabase
            .from('user_progress')
            .upsert(newProgress, { onConflict: 'user_id,flashcard_id' })
            .select()
            .single();

          if (upsertError) throw upsertError;

          // Update local cache
          setProgress(prev => ({
            ...prev,
            [flashcardId]: data
          }));

          // Update IndexedDB cache
          await cacheUserProgress([data]);
          const cacheKey = `progress:${userId}`;
          await setCacheMetadata(cacheKey, { timestamp: Date.now() });

          return data;
        } else {
          // Queue for later sync
          const queueId = await queueProgressUpdate({
            user_id: userId,
            flashcard_id: flashcardId,
            ...newProgress
          });

          // Update local state optimistically
          setProgress(prev => ({
            ...prev,
            [flashcardId]: newProgress
          }));

          // Update IndexedDB cache
          await cacheUserProgress([newProgress]);

          return { ...newProgress, _queueId: queueId };
        }
      } catch (err) {
        console.error('Failed to update progress:', err);
        throw err;
      }
    },
    [userId, progress]
  );

  /**
   * Sync offline progress updates with Supabase
   */
  const syncProgress = useCallback(async () => {
    if (!navigator.onLine) {
      console.warn('Cannot sync: offline');
      return;
    }

    if (!userId) {
      console.error('User ID required to sync progress');
      return;
    }

    try {
      setIsSyncing(true);
      const pendingUpdates = await getPendingSyncQueue();

      if (pendingUpdates.length === 0) {
        setIsSyncing(false);
        return;
      }

      for (const update of pendingUpdates) {
        const { _queueId, ...progressData } = update;

        try {
          const { error } = await supabase
            .from('user_progress')
            .upsert(progressData, { onConflict: 'user_id,flashcard_id' });

          if (error) throw error;

          // Mark as synced in queue
          await markSyncedInQueue(_queueId);
        } catch (err) {
          console.error(`Failed to sync update ${_queueId}:`, err);
        }
      }

      // Refresh progress from server
      const { data: userProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      if (userProgress) {
        await cacheUserProgress(userProgress);
        const progressMap = {};
        for (const item of userProgress) {
          progressMap[item.flashcard_id] = item;
        }
        setProgress(progressMap);
      }

      setIsSyncing(false);
    } catch (err) {
      console.error('Sync failed:', err);
      setIsSyncing(false);
      throw err;
    }
  }, [userId]);

  return { progress, loading, error, updateProgress, syncProgress, isSyncing };
}
