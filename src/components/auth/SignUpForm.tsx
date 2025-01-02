import { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { supabase } from '../../lib/supabase/client';

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
  const [data, setData] = useState(null);

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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: tempUsername,
            email: email,
            newsletter: newsletter,
          }
        }
      });

      if (signUpError) throw signUpError;

      // If we got here, the signup was successful
      setShowVerificationMessage(true);
      setData(signUpData);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
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
            <h3 className="font-semibold text-purple-800 mb-2">Or use this verification code:</h3>
            <p className="font-mono text-lg text-center bg-white p-3 rounded border border-purple-200">
              {data?.user?.confirmation_sent_at}
            </p>
            <p className="text-sm text-purple-700 mt-2">
              You can enter this code manually at{' '}
              <a href="/auth/verify" className="underline">
                the verification page
              </a>
            </p>
          </div>

          <div className="text-sm text-center text-gray-600">
            <p>Click the link in your email to verify your account.</p>
            <p className="mt-2">
              If you don't see it, check your spam folder or{' '}
              <button
                onClick={() => {
                  // TODO: Implement resend functionality
                  console.log('Resend verification email');
                }}
                className="text-purple-600 hover:text-purple-700"
              >
                resend the email
              </button>
            </p>
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