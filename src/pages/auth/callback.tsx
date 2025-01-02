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
        const code = searchParams.get('code');
        
        if (errorParam) {
          throw new Error(errorDescription || 'Authentication error');
        }

        // If we have a code, exchange it for a session
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          
          if (!data.session?.user) {
            throw new Error('No session found after code exchange');
          }

          // Sync user profile
          await syncUserProfile(data.session.user);

          // Redirect to profile page after successful verification
          navigate('/profile');
          return;
        }

        // Get the current session for other auth flows
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
