import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * Hook for managing levels (A1, A2, B1) with admin CRUD operations
 * Provides real-time updates to level metadata
 */
export function useAdminLevels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all levels
  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, 'levels'), orderBy('display_order'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setLevels(data);
          setError(null);
        } catch (err) {
          console.error('Error loading levels:', err);
          setError(err.message);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to levels:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update level metadata
  const update = useCallback(async (id, data) => {
    try {
      setError(null);
      await updateDoc(doc(db, 'levels', id), {
        ...data,
        updated_at: new Date()
      });
    } catch (err) {
      console.error('Error updating level:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Reorder levels
  const reorder = useCallback(async (orderedIds) => {
    try {
      setError(null);
      const batch = await import('firebase/firestore').then(
        (m) => m.writeBatch
      );
      const batchWriter = batch(db);

      orderedIds.forEach((id, index) => {
        batchWriter.update(doc(db, 'levels', id), {
          display_order: index,
          updated_at: new Date()
        });
      });

      await batchWriter.commit();
    } catch (err) {
      console.error('Error reordering levels:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    levels,
    loading,
    error,
    update,
    reorder
  };
}
