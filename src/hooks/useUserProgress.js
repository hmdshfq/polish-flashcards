import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { calculateNextReview } from '../utils/spacedRepetition';

/**
 * Hook for managing user progress with real-time sync
 * Automatically syncs progress across tabs and devices
 * Firestore SDK handles offline queueing automatically
 *
 * @param {string} userId - The user ID
 * @returns {object} { progress, loading, error, updateProgress, isSyncing }
 */
export function useUserProgress(userId) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to real-time progress updates
  useEffect(() => {
    if (!userId) {
      setProgress({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to user's progress subcollection with metadata
    // This enables real-time updates and tracks pending writes
    const unsubscribe = onSnapshot(
      collection(db, 'user_progress', userId, 'cards'),
      { includeMetadataChanges: true },
      (snapshot) => {
        // Detect if sync is in progress based on metadata
        const hasPendingWrites = snapshot.metadata.hasPendingWrites;
        const fromCache = snapshot.metadata.fromCache;
        setIsSyncing(hasPendingWrites || (fromCache && navigator.onLine));

        // Build progress map from snapshot
        const progressMap = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          progressMap[doc.id] = {
            flashcard_id: doc.id,
            ease_factor: data.ease_factor,
            review_count: data.review_count,
            // Convert Firestore Timestamps to ISO strings
            last_reviewed_at: data.last_reviewed_at?.toDate?.()?.toISOString(),
            next_review_at: data.next_review_at?.toDate?.()?.toISOString()
          };
        });

        setProgress(progressMap);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to fetch progress:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * Update progress for a flashcard
   * Implements SM-2 spaced repetition algorithm
   * Firestore SDK automatically queues writes when offline
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
          // Update existing progress using SM-2 algorithm
          const newEaseFactor = Math.max(
            1.3,
            existingProgress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
          );

          // If quality < 3, reset the repetition count, otherwise increment
          const newReviewCount = quality < 3 ? 1 : (existingProgress.review_count || 1) + 1;

          newProgress = {
            ease_factor: newEaseFactor,
            review_count: newReviewCount,
            last_reviewed_at: Timestamp.fromDate(now),
            next_review_at: Timestamp.fromDate(
              new Date(calculateNextReview(newEaseFactor, newReviewCount, quality, now))
            )
          };
        } else {
          // Create new progress entry
          newProgress = {
            ease_factor: 2.5,
            review_count: 1,
            last_reviewed_at: Timestamp.fromDate(now),
            next_review_at: Timestamp.fromDate(
              new Date(calculateNextReview(2.5, 1, quality, now))
            )
          };
        }

        // Write to Firestore
        // The SDK automatically queues this write if offline and syncs when back online
        const docRef = doc(db, 'user_progress', userId, 'cards', flashcardId);
        await setDoc(docRef, newProgress, { merge: true });

        // onSnapshot listener will update state automatically
        return newProgress;
      } catch (err) {
        console.error('Failed to update progress:', err);
        throw err;
      }
    },
    [userId, progress]
  );

  return { progress, loading, error, updateProgress, isSyncing };
}
