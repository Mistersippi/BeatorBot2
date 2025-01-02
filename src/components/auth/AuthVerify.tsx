import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp } from '../../lib/supabase/auth/operations';
import { Mail, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

export function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  // Debug function
  const debugVerification = () => {
    console.log('Current State:', {
      searchParams: Object.fromEntries(searchParams),
      email,
      code,
      verifying,
      error
    });

    // Log Supabase config
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('Supabase URL configured:', supabaseUrl);
    console.log('Anon Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  };

  // Monitor auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const verifyFromLink = async () => {
      try {
        debugVerification();
        
        // Get token_hash and type from URL params
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'signup';
        
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
          toast.success('Email verified successfully!');
          navigate('/profile/settings');
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
  }, [navigate, searchParams]);

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    debugVerification();

    if (!code || !email) {
      setError('Please enter both email and verification code');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      console.log('Attempting verification with:', { code, email });

      const { data, error: verifyError } = await verifyOtp(code, 'signup');

      if (verifyError) throw verifyError;

      setSuccess(true);
      toast.success('Email verified successfully!');
      navigate('/profile/settings');
    } catch (err) {
      console.error('Manual verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify email');
    } finally {
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Email Verified Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Redirecting you to your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            Enter the verification code sent to your email
          </p>
        </div>

        <form onSubmit={handleManualVerification} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || !code || !email}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {verifying ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={18} />
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
