import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Initialize anonymous authentication for the current user
 * Creates a new anonymous session if one doesn't exist
 */
export async function initializeAuth() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data.user;
    }

    return user;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await supabase.auth.signOut();
}
