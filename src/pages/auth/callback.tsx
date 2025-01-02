import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { syncUserProfile } from '../../lib/supabase/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || 'Authentication error');
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error('No session found');
        }

        // Sync user profile
        await syncUserProfile(session.user);

        // Determine redirect based on type
        const type = searchParams.get('type');
        switch (type) {
          case 'recovery':
            navigate('/auth/reset-password');
            break;
          case 'signup':
            navigate('/profile');
            break;
          default:
            navigate('/');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during authentication');
        // On error, redirect to login after 5 seconds
        setTimeout(() => navigate('/'), 5000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you shortly...</p>
        </div>
      </div>
    );
  }

  return null;
}
