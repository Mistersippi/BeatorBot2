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
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!email || !password || !confirmPassword) {
        throw new Error('All fields are required');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!terms) {
        throw new Error('You must accept the terms and conditions');
      }

      // Generate a simple username from email
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const tempUsername = `${baseUsername}_${Date.now().toString(36)}`;

      // Attempt signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Important: Update this path to match your route structure
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: tempUsername,
            email: email,
            newsletter: newsletter,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Store the signup data
      setData(signUpData);
      setShowVerificationMessage(true);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
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
    }
  };

  if (showVerificationMessage) {
    return (
      <AuthModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        title="Verify Your Email"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-lg mt-2 mb-4">{email}</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
            <p className="font-semibold text-purple-800 mb-2">Or use this verification code:</p>
            <div className="bg-white p-3 rounded border border-purple-200">
              <p className="font-mono text-lg text-center">
                {/* Display the token from the session */}
                {data?.session?.access_token?.slice(-6) || 'Loading...'}
              </p>
            </div>
            <button
              onClick={() => navigate('/auth/verify')}
              className="mt-3 w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Go to verification page
            </button>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>Can't find the email? Check your spam folder or</p>
            <button
              onClick={handleResendEmail}
              className="text-purple-600 hover:text-purple-700 font-medium mt-2"
            >
              Resend verification email
            </button>
          </div>
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