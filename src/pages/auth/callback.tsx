import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { createUserProfile } from '../../lib/supabase/auth/operations';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Callback URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));

        // Check if this is a verified email
        const verified = searchParams.get('verified') === 'true';
        const type = searchParams.get('type');

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If no session, redirect to login
        if (!session?.user) {
          console.log('No session found, redirecting to login');
          navigate('/login');
          return;
        }

        const { user } = session;
        console.log('User session:', user);

        // If this is a verified signup, create the user profile
        if (verified && type === 'signup') {
          console.log('Creating user profile for verified signup');
          const { error: profileError } = await createUserProfile(user);
          if (profileError) throw profileError;
        }

        // Handle different auth types
        switch (type) {
          case 'recovery':
            navigate('/auth/reset-password');
            break;
          case 'magiclink':
            navigate('/profile');
            break;
          case 'signup':
            if (verified) {
              navigate('/profile');
            } else {
              navigate('/auth/verify-notice');
            }
            break;
          default:
            navigate('/profile');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg">Setting up your account...</p>
      </div>
    </div>
  );
}
