import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { Loader, XCircle, CheckCircle, Mail } from 'lucide-react';
import { verifyOtp } from '../../lib/supabase/auth/operations';

export function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setShowSignIn } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyFromLink = async () => {
      try {
        // Check URL hash for parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Try to get parameters from both query and hash
        const token = searchParams.get('token') || hashParams.get('token');
        const type = searchParams.get('type') || hashParams.get('type') || 'signup';
        const linkEmail = searchParams.get('email') || hashParams.get('email');
        
        // Check for error in URL
        const urlError = searchParams.get('error_description');
        if (urlError) {
          throw new Error(decodeURIComponent(urlError));
        }

        // If we have token and email from the link, verify automatically
        if (token && linkEmail) {
          setVerifying(true);
          console.log('Verifying with params:', { token, type, email: linkEmail });

          const { data, error: verifyError } = await verifyOtp(
            token,
            type as 'signup' | 'recovery' | 'invite' | 'email',
            linkEmail
          );

          if (verifyError) throw verifyError;

          console.log('Verification successful:', data);
          setSuccess(true);
          toast.success('Email verified successfully! You can now sign in.');
          
          setTimeout(() => {
            setShowSignIn(true);
            navigate('/');
          }, 2000);
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
        code,
        'signup',
        email
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
          onClick={() => {
            setError(null);
            setCode('');
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
        <p className="text-gray-600">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            Enter the verification code sent to your email
          </p>
        </div>

        <form onSubmit={handleManualVerification} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="Enter your email"
              required
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="Enter 6-digit code"
              required
            />
          </div>

          <button
            type="submit"
            disabled={verifying || !code || !email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-purple-600 hover:text-purple-500"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
