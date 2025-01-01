import { supabase } from '../client';

export function validateUsername(username: string): string | null {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be less than 30 characters';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores and hyphens, and must start with a letter or number';
  }
  return null;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Username check error:', error);
      throw error;
    }

    return !data; // Return true if username is available (no matching record found)
  } catch (error) {
    console.error('Username availability check failed:', error);
    // If there's an error checking, we'll assume the username is taken to be safe
    return false;
  }
}