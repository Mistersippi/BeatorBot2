import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the current site URL in development or production
const siteUrl = import.meta.env.DEV 
  ? 'http://localhost:5175'
  : import.meta.env.VITE_SITE_URL;

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: import.meta.env.DEV, // Only enable debug in development
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          if (typeof window === 'undefined') return null;
          return window.localStorage.getItem(key);
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          if (typeof window === 'undefined') return;
          window.localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          if (typeof window === 'undefined') return;
          window.localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    },
    auth: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  },
  global: {
    headers: {
      'x-my-custom-header': 'BeatorBot2'
    }
  }
});

// Service role client for admin operations
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Set up auth configuration
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session); // Add logging
  if (event === 'SIGNED_IN') {
    console.log('User signed in, redirecting to callback');
  }
});

export const getSupabaseClient = () => supabase;