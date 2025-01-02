import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Try automatic verification with token_hash from URL
  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    if (token_hash) {
      verifyWithToken(token_hash);
    }
  }, [searchParams]);

  const verifyWithToken = async (token_hash: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      });

      if (error) throw error;
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Token verification failed:', err);
      setError('Automatic verification failed. Please try using the code below.');
      toast.error('Verification failed. Please try using the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        token: verificationCode,
        type: 'signup'
      });

      if (error) throw error;
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Code verification failed:', err);
      setError('Invalid verification code. Please try again.');
      toast.error('Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isVerifying ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          ) : error ? (
            <div className="mb-6">
              <p className="text-red-600 text-sm">{error}</p>
              <form onSubmit={verifyWithCode} className="mt-4 space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="code"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Verify Email
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Attempting automatic verification...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
