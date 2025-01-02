import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { syncUserProfile } from '../../lib/supabase/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        // Get URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        console.log('Verification params:', { token, type });

        if (!token) {
          throw new Error('No verification token found');
        }

        // Verify the token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });

        if (verifyError) {
          console.error('Verification error:', verifyError);
          throw verifyError;
        }

        if (!data.session) {
          throw new Error('No session created after verification');
        }

        // Sync user profile after successful verification
        await syncUserProfile(data.session.user);

        // Redirect to profile page
        navigate('/profile', { replace: true });
      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
        // On error, redirect to home after 5 seconds
        setTimeout(() => navigate('/'), 5000);
      } finally {
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [navigate, searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Just a moment while we confirm your email address...</p>
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
