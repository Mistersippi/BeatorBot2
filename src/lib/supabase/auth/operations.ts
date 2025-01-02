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
    // Generate a temporary username if not provided
    let username = metadata?.username;
    
    if (!username) {
      // Generate a valid username that starts with 'user_' followed by alphanumeric characters
      username = `user_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Validate the username format
    const validationError = validateUsername(username);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Ensure username is unique by adding random suffix if needed
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const { data, error } = await supabaseAdmin!.from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        isUnique = true;
      } else {
        username = `user_${Math.random().toString(36).substring(2, 10)}`;
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate unique username');
    }

    // Get the site URL for email redirect
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (!siteUrl) {
      console.error('VITE_SITE_URL is not configured. This will affect email redirects.');
    }

    // Always use production domain for email redirects in production
    const isProd = import.meta.env.PROD;
    const redirectUrl = isProd ? 'https://www.beatorbot.com' : (siteUrl || window.location.origin);

    // Perform signUp with metadata and email redirect
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          username,
          pending_email_verification: true,
          has_set_username: false
        },
        emailRedirectTo: `${redirectUrl}/auth/callback`
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }

    // Create user profile immediately after signup
    if (data?.user) {
      const { error: profileError } = await syncUserProfile(data.user);
      if (profileError) {
        console.error('Error syncing user profile:', profileError);
        throw profileError;
      }
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

export async function verifyOtp(token: string, type: 'signup' | 'recovery' | 'invite' | 'email', email: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token,
      type,
      email
    });

    if (error) throw error;

    // If this is a signup verification, ensure the user profile exists
    if (type === 'signup' && data?.user) {
      await syncUserProfile(data.user);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Verification error:', error);
    return { data: null, error };
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

export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    
    // After password update, sync the user profile
    if (data?.user) {
      await syncUserProfile(data.user);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
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
