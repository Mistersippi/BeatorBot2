import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import { syncUserProfile } from '../../lib/supabase/auth';

interface AuthUser extends User {
  username?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showSignIn: boolean;
  showSignUp: boolean;
  setShowSignIn: (show: boolean) => void;
  setShowSignUp: (show: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { username?: string }) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          return;
        }

        if (session?.user) {
          await syncUserProfile(session.user);
          setUser(session.user as AuthUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      
      if (session?.user) {
        await syncUserProfile(session.user);
        setUser(session.user as AuthUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await syncUserProfile(data.user);
        setUser(data.user as AuthUser);
        setShowSignIn(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { username?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?type=email&next=/welcome`,
          data: {
            username: metadata?.username || email.split('@')[0],
            pending_email_verification: true
          },
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      const requiresEmailConfirmation = data?.user?.identities?.length === 0;
      
      if (!requiresEmailConfirmation && data.user) {
        await syncUserProfile(data.user);
        setUser(data.user as AuthUser);
      }
      
      return { requiresEmailConfirmation };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showSignIn,
        showSignUp,
        setShowSignIn,
        setShowSignUp,
        signIn,
        signUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}