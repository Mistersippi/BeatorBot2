import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle automatic verification through link
  useEffect(() => {
    const verifyToken = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (token_hash) {
        setVerifying(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any || 'signup'
          });

          if (error) throw error;
          navigate('/?verified=true', { replace: true });
        } catch (err) {
          console.error('Verification error:', err);
          setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  // Handle manual code verification
  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        token: code,
        type: 'signup'
      });

      if (error) throw error;
      navigate('/?verified=true', { replace: true });
    } catch (err) {
      console.error('Manual verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-center text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleManualVerification}>
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={!code || verifying}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Didn't receive the code?{' '}
          <button
            onClick={() => {
              // TODO: Implement resend functionality
              console.log('Resend verification email');
            }}
            className="text-purple-600 hover:text-purple-700"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
