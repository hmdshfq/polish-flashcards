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
 * Hook for managing categories with admin CRUD operations
 * Provides real-time updates to category data
 */
export function useAdminCategories(levelId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories for the specified level
  useEffect(() => {
    if (!levelId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Note: Omit orderBy with filters to avoid composite index requirement
    // Client-side sorting in DataTable will handle ordering
    const q = query(
      collection(db, 'categories'),
      where('level_id', '==', levelId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setCategories(data);
          setError(null);
        } catch (err) {
          console.error('Error loading categories:', err);
          setError(err.message);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to categories:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [levelId]);

  // Create category
  const create = useCallback(async (data) => {
    try {
      setError(null);
      // Generate slug from category name
      const slug = data.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      const docRef = await addDoc(collection(db, 'categories'), {
        ...data,
        slug,
        created_at: new Date(),
        display_order: Date.now()
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Update category
  const update = useCallback(async (id, data) => {
    try {
      setError(null);
      // Generate slug if name was changed
      const updateData = { ...data };
      if (data.name) {
        updateData.slug = data.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
      }

      await updateDoc(doc(db, 'categories', id), {
        ...updateData,
        updated_at: new Date()
      });
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Reorder categories
  const reorder = useCallback(async (orderedIds) => {
    try {
      setError(null);
      const batch = writeBatch(db);

      orderedIds.forEach((id, index) => {
        batch.update(doc(db, 'categories', id), {
          display_order: index,
          updated_at: new Date()
        });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error reordering categories:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    categories,
    loading,
    error,
    create,
    update,
    delete: deleteCategory,
    reorder
  };
}
