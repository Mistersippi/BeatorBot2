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

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        
        if (!token || !type || !email) {
          throw new Error('Invalid verification link - missing required parameters');
        }

        // Verify the email
        const { error: verifyError } = await verifyOtp(
          token,
          type as 'signup' | 'recovery' | 'invite' | 'email',
          email
        );

        if (verifyError) throw verifyError;

        // Show success message
        toast.success('Email verified successfully!');
        
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
        <h1 className="text-xl font-semibold mb-2">Verifying your email...</h1>
        <p className="text-gray-600">Please wait while we verify your email address.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <XCircle className="w-8 h-8 text-red-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
      <h1 className="text-xl font-semibold mb-2">Email Verified!</h1>
      <p className="text-gray-600">Redirecting you to sign in...</p>
    </div>
  );
}
