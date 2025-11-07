import { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

/**
 * Auth context to ensure a single instance of useAuth across the entire app
 * This prevents multiple onAuthStateChanged listeners and state inconsistencies
 */
/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
