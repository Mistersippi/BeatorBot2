import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        // Get URL parameters
        const token = searchParams.get('token_hash') || searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Verification params:', { token, type, email, error, errorDescription });

        if (error || errorDescription) {
          throw new Error(errorDescription || error || 'Verification failed');
        }

        // If we have a token, verify it
        if (token) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: (type || 'signup') as 'signup' | 'email' | 'recovery' | 'invite',
            email: email as string,
          });

          if (verifyError) throw verifyError;

          // After successful verification, redirect to callback with the same parameters
          const callbackParams = new URLSearchParams(searchParams);
          callbackParams.append('verified', 'true');
          navigate('/auth/callback?' + callbackParams.toString(), { replace: true });
          return;
        }

        // If no token but we have type and email, redirect to callback
        if (type && email) {
          navigate('/auth/callback?' + searchParams.toString(), { replace: true });
          return;
        }

        throw new Error('Invalid verification link - missing required parameters');
      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
