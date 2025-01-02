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
    flowType: 'pkce',
    detectSessionInUrl: true,
    debug: true // Enable debug mode
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

// Update auth configuration
supabase.auth.setSession({
  access_token: '',
  refresh_token: '',
});

// Set up auth redirect URL
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session); // Add logging
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    window.location.href = siteUrl;
  }
});

export const getSupabaseClient = () => supabase;