import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error' | 'idle';
  setSyncStatus: (status: 'synced' | 'syncing' | 'offline' | 'error' | 'idle') => void;
  signInWithGoogle: () => Promise<{ success: boolean; cancelled?: boolean; error?: string; user?: User }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAnonymous: false,
  syncStatus: 'idle',
  setSyncStatus: () => {},
  signInWithGoogle: async () => ({ success: false }),
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error' | 'idle'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Only treat authenticated users with real accounts (e.g., Google sign-in) as active user
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ success: boolean; cancelled?: boolean; error?: string; user?: User }> => {
    try {
      setSyncStatus('syncing');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
      }
      setSyncStatus('synced');
      return { success: true, user: result.user };
    } catch (err: any) {
      // Gracefully handle standard user closure or cancellation of popup
      const isCancelled =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user') ||
        err?.message?.includes('cancelled-popup-request');

      if (isCancelled) {
        setSyncStatus(user ? 'synced' : 'idle');
        return { success: false, cancelled: true };
      }

      console.warn('Sign-in with Google notice:', err?.message || err);
      setSyncStatus('error');
      return {
        success: false,
        error: err?.message || 'Failed to sign in with Google',
      };
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('idle');
    } catch (err: any) {
      console.warn('Sign-out notice:', err?.message || err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAnonymous: Boolean(user?.isAnonymous),
        syncStatus,
        setSyncStatus,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
