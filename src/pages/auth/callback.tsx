import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { syncUserProfile } from '../../lib/supabase/auth';
import toast from 'react-hot-toast';

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

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Sync user profile
          await syncUserProfile(session.user);
          
          // Show success message
          toast.success('Email verified successfully!', {
            duration: 5000,
            position: 'top-center',
          });

          // Redirect to home
          navigate('/', { replace: true });
          return;
        }

        // If no session but we have a code, try to exchange it
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;

          if (!data.session?.user) {
            throw new Error('No session found after code exchange');
          }

          // Sync user profile
          await syncUserProfile(data.session.user);

          // Show success message
          toast.success('Email verified successfully!', {
            duration: 5000,
            position: 'top-center',
          });

          // Redirect to home
          navigate('/', { replace: true });
          return;
        }

        throw new Error('No session or code found');
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
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Verification</h2>
          <p className="text-gray-600">Just a moment while we verify your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">Redirecting you to the home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
