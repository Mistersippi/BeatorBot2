import { supabase, supabaseAdmin } from '../client';
import { validateUsername } from './validation';
import { User, AuthError, AuthResponse } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

interface SignUpResponse {
  data: AuthResponse['data'] | null;
  error: AuthError | Error | null;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

export async function signUpWithEmail(
  email: string, 
  password: string, 
  metadata?: { username?: string }
): Promise<SignUpResponse> {
  try {
    // Generate username if not provided
    const username = metadata?.username || await generateUsername();

    // Simplify the redirect URL handling
    const redirectUrl = import.meta.env.PROD 
      ? 'https://www.beatorbot.com/auth/callback'
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          username,
          pending_email_verification: true,
          has_set_username: false
        },
        emailRedirectTo: redirectUrl
      },
    });

    if (error) throw error;

    // Create user profile immediately after signup
    if (data?.user) {
      await syncUserProfile(data.user);
    }

    return {
      data,
      error: null,
      requiresEmailConfirmation: true
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error: error as AuthError | Error,
      requiresEmailConfirmation: false
    };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

export async function verifyOtp(
  token_hash: string, 
  type: 'signup' | 'recovery' | 'invite' | 'email'
) {
  try {
    // Decode the token_hash since it comes from a URL
    const decodedToken = decodeURIComponent(token_hash);
    console.log('Verifying with token:', decodedToken, 'type:', type); // Debug log

    // Use verifyOtp with token_hash
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: decodedToken,
      type
    });

    if (error) {
      console.error('OTP verification error:', error); // Debug log
      throw error;
    }

    console.log('Verification response:', data); // Debug log

    // If verification successful and we have a user, sync their profile
    if (data?.user) {
      console.log('Updating user metadata for:', data.user.id); // Debug log

      // Update user metadata to remove pending flag
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          pending_email_verification: false,
          email_verified: true
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
      }

      // Sync user profile
      await syncUserProfile(data.user);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Verification error:', error);
    return { data: null, error };
  }
}

export async function resetPassword(email: string) {
  try {
    const redirectUrl = import.meta.env.PROD 
      ? 'https://www.beatorbot.com/auth/reset-password'
      : `${window.location.origin}/auth/reset-password`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error };
  }
}

export async function updatePassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error };
  }
}

export async function syncUserProfile(user: User) {
  try {
    if (!user.email) {
      throw new Error('User email is required');
    }

    // First try to find existing user by email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single<Database['public']['Tables']['users']['Row'] | null>();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 means not found
      throw findError;
    }

    const userData: Database['public']['Tables']['users']['Update'] = {
      auth_id: user.id,
      email: user.email,
      username: user.user_metadata.username || `user_${Math.random().toString(36).substring(2, 8)}`,
      avatar_url: user.user_metadata.avatar_url || null,
      has_set_username: !!existingUser?.username,
      account_status: 'active',
      account_type: 'user',
      metadata: {}
    };

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('email', user.email)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data;
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert([userData])  // Wrap userData in an array
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
    throw error;
  }
}

export async function createUserProfile(user: any) {
  try {
    const username = user.user_metadata?.username;
    if (!username) {
      throw new Error('Username not found in user metadata');
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        auth_id: user.id,
        email: user.email,
        username,
        has_set_username: true,
        metadata: {},
        account_status: 'active',
        account_type: 'user'
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError;
    }

    // Update user metadata to remove pending flag
    const { error: updateError } = await supabase.auth.updateUser({
      data: { 
        username,
        pending_email_verification: false
      }
    });

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      throw updateError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { error };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (!siteUrl) {
      console.error('VITE_SITE_URL is not configured. This will affect email redirects.');
    }

    // Always use production domain for email redirects in production
    const isProd = import.meta.env.PROD;
    const redirectUrl = isProd ? 'https://www.beatorbot.com' : (siteUrl || window.location.origin);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/auth/callback?type=recovery&next=/account/update-password`
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { data: null, error };
  }
}

export async function sendMagicLink(email: string) {
  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (!siteUrl) {
      console.error('VITE_SITE_URL is not configured. This will affect email redirects.');
    }

    // Always use production domain for email redirects in production
    const isProd = import.meta.env.PROD;
    const redirectUrl = isProd ? 'https://www.beatorbot.com' : (siteUrl || window.location.origin);

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/auth/callback?type=magiclink&next=/`
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Magic link error:', error);
    return { data: null, error };
  }
}

export async function inviteUser(email: string) {
  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (!siteUrl) {
      console.error('VITE_SITE_URL is not configured. This will affect email redirects.');
    }

    // Always use production domain for email redirects in production
    const isProd = import.meta.env.PROD;
    const redirectUrl = isProd ? 'https://www.beatorbot.com' : (siteUrl || window.location.origin);

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${redirectUrl}/auth/callback?type=invite&next=/welcome`,
      data: {
        invited: true,
        pending_email_verification: true
      }
    });

    if (error) throw error;
    return { 
      data, 
      error: null,
      message: 'Invitation sent successfully.'
    };
  } catch (error) {
    console.error('Invite error:', error);
    return { 
      data: null, 
      error: error as AuthError | Error,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Updates a user's username and marks it as set
 * @param username - The new username to set
 * @returns The updated user data or throws an error
 */
export async function updateUsername(username: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate username format
    const validationError = validateUsername(username);
    if (validationError) {
      throw new Error(validationError);
    }

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) throw new Error('Username is already taken');

    // Update auth metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { 
        username,
        has_set_username: true
      }
    });

    if (metadataError) throw metadataError;

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        username,
        has_set_username: true
      })
      .eq('auth_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return { data: updatedUser, error: null };

  } catch (error) {
    console.error('Error updating username:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
}

export async function checkUsernameAvailability(username: string) {
  try {
    console.log('Checking availability for username:', username);

    // Use a count query instead of select
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);

    console.log('Username check response:', { data, error, count });

    if (error) {
      console.error('Username check error:', error);
      return {
        available: false,
        error: error
      };
    }

    // If count is 0, username is available
    return {
      available: count === 0,
      error: null
    };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return {
      available: false,
      error: error instanceof Error ? error : new Error('Failed to check username availability')
    };
  }
}

export async function signUp(email: string, password: string, options?: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        ...options
      }
    });

    if (error) throw error;

    return {
      data,
      error: null,
      requiresEmailConfirmation: true
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      data: null,
      error,
      requiresEmailConfirmation: false
    };
  }
}
