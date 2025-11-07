import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Missing Firebase environment variables. Please check your .env.local file.\n' +
    'Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
    'VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, ' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development (requires VITE_USE_EMULATORS=true)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase emulators');
  } catch (err) {
    // Emulator already connected or not available
    if (!err.message.includes('already connected')) {
      console.warn('Failed to connect to Firebase emulators:', err.message);
    }
  }
}

// Enable offline persistence with unlimited cache
// This allows the app to work completely offline and syncs when back online
enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab
    console.warn('Offline persistence disabled: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence (e.g., private browsing in some browsers)
    console.warn('Offline persistence not supported in this browser');
  } else {
    console.error('Failed to enable offline persistence:', err);
  }
});

/**
 * Initialize anonymous authentication
 * Creates a new anonymous session if none exists
 * Sets up persistence to maintain auth state across page reloads
 */
export async function initializeAuth() {
  try {
    // Set persistence to localStorage for all auth operations
    await setPersistence(auth, browserLocalPersistence);

    const currentUser = auth.currentUser;
    if (currentUser) {
      return currentUser;
    }

    const { user } = await signInAnonymously(auth);
    return user;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 * Callback will be called immediately with the current auth state,
 * then again whenever the auth state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
}

/**
 * Sign up with email and password
 * Creates a new user account and signs out any anonymous session
 */
export async function signUpWithEmail(email, password) {
  try {
    // Ensure persistence is set to localStorage
    await setPersistence(auth, browserLocalPersistence);

    // Sign out the anonymous user first to avoid session conflicts
    if (auth.currentUser?.isAnonymous) {
      await firebaseSignOut(auth);
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up failed:', error.message);
    throw error;
  }
}

/**
 * Sign in with email and password
 * Returns the user if successful and signs out any anonymous session
 */
export async function signInWithEmail(email, password) {
  try {
    // Ensure persistence is set to localStorage
    await setPersistence(auth, browserLocalPersistence);

    // Sign out the anonymous user first to avoid session conflicts
    if (auth.currentUser?.isAnonymous) {
      await firebaseSignOut(auth);
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in failed:', error.message);
    throw error;
  }
}

export { db, auth };
