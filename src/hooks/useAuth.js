import { useState, useEffect } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentUser,
  onAuthChange
} from '../services/firebase';

/**
 * Hook for managing user authentication
 * Provides access to current user and auth methods
 * Handles both anonymous and email/password authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          isAnonymous: authUser.isAnonymous,
          displayName: authUser.displayName,
          metadata: authUser.metadata
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const newUser = await signUpWithEmail(email, password);
      return newUser;
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const signedInUser = await signInWithEmail(email, password);
      return signedInUser;
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      setError('Failed to sign out');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? true
  };
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/user-not-found': 'Email not found. Please check or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'Email already in use. Please sign in or use a different email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password authentication is not enabled.',
    'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/invalid-credential': 'Invalid email or password.'
  };

  return errorMessages[errorCode] || 'An authentication error occurred. Please try again.';
}
