import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface SignUpFormProps {
  showSignUp: boolean;
  setShowSignUp: (show: boolean) => void;
  switchToSignIn: () => void;
}

export function SignUpForm({ showSignUp, setShowSignUp, switchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingCode(true);
    setError(null);

    try {
      if (!termsAccepted) {
        throw new Error('You must accept the terms and conditions');
      }

      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const tempUsername = `${baseUsername}_${Date.now().toString(36)}`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
          data: {
            username: tempUsername,
            email: email,
            newsletter: newsletter,
          }
        }
      });

      if (signUpError) throw signUpError;

      setShowVerificationMessage(true);
      toast.success('Please check your email for the verification link!');

    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
      toast.error(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoadingCode(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (error) throw error;

      toast.success('Verification email resent! Please check your inbox.');
    } catch (err) {
      console.error('Error resending verification:', err);
      toast.error('Failed to resend verification email. Please try again.');
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
            <p className="text-sm text-gray-600 mb-2">
              Click the link in your email to verify your account. The verification link will expire in 24 hours.
            </p>
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
              onClick={handleResendVerification}
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
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="newsletter"
            name="newsletter"
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
            Subscribe to our newsletter
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I accept the terms and conditions
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoadingCode}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isLoadingCode ? 'Signing up...' : 'Sign up'}
          </button>
        </div>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={switchToSignIn}
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </AuthModal>
  );
}