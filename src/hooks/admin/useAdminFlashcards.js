import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  orderBy
} from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * Hook for managing flashcards with admin CRUD operations
 * Provides real-time updates to flashcard data
 */
export function useAdminFlashcards(filters = {}) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build query with filters
  useEffect(() => {
    let q = collection(db, 'flashcards');
    const conditions = [];

    if (filters.level) {
      conditions.push(where('level_id', '==', filters.level));
    }

    if (filters.category && filters.category !== 'all') {
      conditions.push(where('category_slug', '==', filters.category));
    }

    if (filters.mode && filters.mode !== 'all') {
      conditions.push(where('mode', '==', filters.mode));
    }

    if (conditions.length > 0) {
      q = query(q, ...conditions, orderBy('display_order'));
    } else {
      q = query(q, orderBy('display_order'));
    }

    setLoading(true);
    setError(null);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setFlashcards(data);
          setError(null);
        } catch (err) {
          console.error('Error loading flashcards:', err);
          setError(err.message);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to flashcards:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.level, filters.category, filters.mode]);

  // Create flashcard
  const create = useCallback(async (data) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'flashcards'), {
        ...data,
        created_at: new Date(),
        display_order: Date.now() // Use timestamp for ordering
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Update flashcard
  const update = useCallback(async (id, data) => {
    try {
      setError(null);
      await updateDoc(doc(db, 'flashcards', id), {
        ...data,
        updated_at: new Date()
      });
    } catch (err) {
      console.error('Error updating flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete flashcard
  const deleteFlashcard = useCallback(async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'flashcards', id));
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Bulk create flashcards
  const bulkCreate = useCallback(async (cardsData) => {
    try {
      setError(null);
      const batch = writeBatch(db);
      const flashcardsRef = collection(db, 'flashcards');

      // Process in batches to respect Firestore's batch write limit
      for (let i = 0; i < cardsData.length; i += 500) {
        const batchCards = cardsData.slice(i, i + 500);
        batchCards.forEach((card) => {
          const newDocRef = doc(flashcardsRef);
          batch.set(newDocRef, {
            ...card,
            created_at: new Date(),
            display_order: Date.now() + i // Ensure unique ordering
          });
        });
      }

      await batch.commit();
      return cardsData.length;
    } catch (err) {
      console.error('Error bulk creating flashcards:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Bulk delete flashcards
  const bulkDelete = useCallback(async (ids) => {
    try {
      setError(null);
      const batch = writeBatch(db);

      ids.forEach((id) => {
        batch.delete(doc(db, 'flashcards', id));
      });

      await batch.commit();
      return ids.length;
    } catch (err) {
      console.error('Error bulk deleting flashcards:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Reorder flashcards
  const reorder = useCallback(async (orderedIds) => {
    try {
      setError(null);
      const batch = writeBatch(db);

      orderedIds.forEach((id, index) => {
        batch.update(doc(db, 'flashcards', id), {
          display_order: index,
          updated_at: new Date()
        });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error reordering flashcards:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    flashcards,
    loading,
    error,
    create,
    update,
    delete: deleteFlashcard,
    bulkCreate,
    bulkDelete,
    reorder
  };
}
