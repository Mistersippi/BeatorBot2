import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { Loader, XCircle, CheckCircle } from 'lucide-react';
import { verifyOtp } from '../../lib/supabase/auth/operations';

export function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setShowSignIn } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        
        if (!token || !type || !email) {
          throw new Error('Invalid verification link - missing required parameters');
        }

        console.log('Verifying with params:', { token, type, email }); // Debug log

        // Verify the email
        const { data, error: verifyError } = await verifyOtp(
          token,
          type as 'signup' | 'recovery' | 'invite' | 'email',
          email
        );

        if (verifyError) {
          console.error('Verification error:', verifyError); // Debug log
          throw verifyError;
        }

        console.log('Verification successful:', data); // Debug log
        setSuccess(true);

        // Show success message
        toast.success('Email verified successfully! You can now sign in.');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          setShowSignIn(true);
          navigate('/');
        }, 2000);

      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify email');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate, searchParams, setShowSignIn]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg">Verifying your email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-4">You can now sign in to your account.</p>
        <p className="text-sm text-gray-500">Redirecting to home page...</p>
      </div>
    );
  }

  return null;
}
