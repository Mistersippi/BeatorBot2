import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/';

        if (!token_hash || !type) {
          throw new Error('Missing verification parameters');
        }

        // Verify the token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup',
        });

        if (verifyError) throw verifyError;

        // Check if we have a session
        if (!data?.session) {
          throw new Error('No session created after verification');
        }

        // Create user profile if needed
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              auth_id: data.session.user.id,
              email: data.session.user.email,
              username: data.session.user.email?.split('@')[0],
              account_status: 'active',
              account_type: 'user',
              has_set_username: false
            }
          ])
          .single();

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
          console.error('Profile creation error:', profileError);
        }

        // Redirect to success page
        navigate(next, { 
          replace: true,
          state: { verified: true }
        });

      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
        
        // Redirect to error page after 5 seconds
        setTimeout(() => {
          navigate('/auth/error', { 
            replace: true,
            state: { error: 'verification_failed' }
          });
        }, 5000);
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
            <p className="text-sm text-red-500">Redirecting you to the error page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
