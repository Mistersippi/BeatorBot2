import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp } from '../../lib/supabase/auth/operations';
import { Mail, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthVerifyProps {
  setShowSignIn: (show: boolean) => void;
}

export function AuthVerify({ setShowSignIn }: AuthVerifyProps) {
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Debug logging
  useEffect(() => {
    console.log('URL Search Params:', Object.fromEntries(searchParams));
    console.log('Current URL:', window.location.href);
  }, [searchParams]);

  useEffect(() => {
    const verifyFromLink = async () => {
      try {
        // Get token_hash and type from URL params - these are what Supabase actually sends
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'signup';
        
        // If we have token_hash, verify automatically
        if (token_hash) {
          setVerifying(true);
          console.log('Verifying with params:', { token_hash, type });

          const { data, error: verifyError } = await verifyOtp(
            token_hash,
            type as 'signup' | 'recovery' | 'invite' | 'email'
          );

          if (verifyError) throw verifyError;

          console.log('Verification successful:', data);
          setSuccess(true);
          toast.success('Email verified successfully! You can now sign in.');
          
          // Redirect after successful verification
          setTimeout(() => {
            setShowSignIn(true);
            navigate('/');
          }, 2000);
        } else {
          console.log('No token_hash found in URL');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify email');
      } finally {
        setVerifying(false);
      }
    };

    verifyFromLink();
  }, [navigate, searchParams, setShowSignIn]);

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !email) {
      setError('Please enter both email and verification code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const { data, error: verifyError } = await verifyOtp(
        code,  // This is the token_hash for manual verification
        'signup'
      );

      if (verifyError) throw verifyError;

      setSuccess(true);
      toast.success('Email verified successfully! You can now sign in.');
      
      setTimeout(() => {
        setShowSignIn(true);
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Manual verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify email');
    } finally {
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Mail className="w-12 h-12 text-green-500 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Email Verified Successfully!
        </h3>
        <p className="text-sm text-gray-500">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {verifying ? (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      ) : (
        <form onSubmit={handleManualVerification} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              placeholder="Enter verification code"
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}
    </div>
  );
}
