import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../useAuth';

/**
 * Hook for checking admin authorization
 * Checks if the current user has an admin role in the user_roles collection
 */
export function useAdminAuth() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no user or user is anonymous, they're not an admin
    if (!user || user.isAnonymous) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Set up real-time listener for user_roles document
    const unsubscribe = onSnapshot(
      doc(db, 'user_roles', user.uid),
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setIsAdmin(data.role === 'admin');
          } else {
            setIsAdmin(false);
          }
          setError(null);
        } catch (err) {
          console.error('Error checking admin status:', err);
          setError(err.message);
          setIsAdmin(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to user_roles:', err);
        setError(err.message);
        setIsAdmin(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return {
    isAdmin,
    loading,
    error,
    userId: user?.uid ?? null
  };
}
