import { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast'; // Import toast
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface SignUpFormProps {
  showSignUp: boolean;
  setShowSignUp: (show: boolean) => void;
  switchToSignIn: () => void;
}

export function SignUpForm({ showSignUp, setShowSignUp, switchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoadingCode(true);

    try {
      if (!email || !password || !confirmPassword) {
        throw new Error('All fields are required');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!terms) {
        throw new Error('You must accept the terms and conditions');
      }

      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const tempUsername = `${baseUsername}_${Date.now().toString(36)}`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: tempUsername,
            email: email,
            newsletter: newsletter,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Extract the code from the session if available
      const code = signUpData?.user?.confirmation_sent_at 
        ? await getVerificationCode(signUpData)
        : null;
      
      setVerificationCode(code);
      setShowVerificationMessage(true);
      setData(signUpData);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setIsLoadingCode(false);
    }
  };

  // Function to get verification code
  const getVerificationCode = async (signUpData: any) => {
    try {
      // The code should be the last 6 characters of the access token
      return signUpData?.session?.access_token?.slice(-6) || null;
    } catch (error) {
      console.error('Error getting verification code:', error);
      return null;
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsLoadingCode(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        toast.error('Failed to resend verification email');
        console.error('Resend error:', error);
      } else {
        toast.success('Verification email resent!');
      }
    } catch (err) {
      console.error('Resend error:', err);
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoadingCode(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <AuthModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        title="Verify Your Email"
      >
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4">
              <Mail className="w-full h-full text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
            <p className="text-gray-600">We've sent a verification link to:</p>
            <p className="font-medium text-purple-600 mt-1">{email}</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
            <p className="font-semibold text-purple-800 mb-2">Or use this verification code:</p>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="font-mono text-lg text-center">
                {isLoadingCode ? (
                  <span className="text-gray-400">Loading...</span>
                ) : verificationCode ? (
                  verificationCode
                ) : (
                  <span className="text-gray-400">Code not available</span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/auth/verify')}
              className="mt-3 w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Go to verification page
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Can't find the email? Check your spam folder or
          </p>
          <button
            onClick={handleResendEmail}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            disabled={isLoadingCode}
          >
            Resend verification email
          </button>
        </div>
      </AuthModal>
    );
  }

  return (
    <AuthModal
      isOpen={showSignUp}
      onClose={() => setShowSignUp(false)}
      title="Create an Account"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="newsletter"
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
              Subscribe to our newsletter
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the Terms and Conditions
            </label>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={switchToSignIn}
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </form>
    </AuthModal>
  );
}