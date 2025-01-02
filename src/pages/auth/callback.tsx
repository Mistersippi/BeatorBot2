import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { syncUserProfile } from '../../lib/supabase/auth';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling');
        
        // Get token hash and other params from URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/';
        const code = searchParams.get('code');
        
        console.log('Auth callback params:', { 
          hasTokenHash: !!token_hash, 
          type, 
          hasCode: !!code 
        });

        // Handle token_hash verification
        if (token_hash) {
          console.log('Verifying with token hash');
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any || 'signup'
          });
          
          if (verifyError) throw verifyError;
        }
        // Handle code verification
        else if (code) {
          console.log('Exchanging code for session');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          throw new Error('No verification parameters found');
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error('No session found after verification');
        }

        // Sync user profile
        console.log('Syncing user profile');
        await syncUserProfile(session.user);
        
        // Show success message
        toast.success('Email verified successfully!', {
          duration: 5000,
          position: 'top-center',
        });

        // Redirect to success page
        navigate(next, { 
          replace: true,
          state: { verified: true }
        });
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
        
        // Show error message
        toast.error('Verification failed. Please try again.', {
          duration: 5000,
          position: 'top-center',
        });

        // Redirect to error page after delay
        setTimeout(() => {
          navigate('/auth/error', { 
            replace: true,
            state: { error: 'verification_failed' }
          });
        }, 3000);
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
            <p className="text-sm text-red-500">Redirecting you to the error page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
