'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Dynamically import Firebase to handle initialization errors
        const { auth } = await import('@/lib/firebase');
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });
        
        setFirebaseInitialized(true);
      } catch (error: any) {
        console.error('Firebase initialization failed:', error);
        setError('Firebase configuration error. Please check your environment variables.');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    if (!firebaseInitialized) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const { auth, googleProvider } = await import('@/lib/firebase');
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else {
        throw new Error(error.message || 'Failed to sign in with Google');
      }
    }
  };

  const logout = async () => {
    if (!firebaseInitialized) {
      return;
    }
    
    try {
      const { auth } = await import('@/lib/firebase');
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to log out');
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    clearError
  };

  // Show error state if Firebase failed to initialize
  if (error && !firebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your Firebase environment variables and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
