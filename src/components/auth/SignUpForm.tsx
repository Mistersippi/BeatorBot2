import { useState } from 'react';
import { Mail, Lock, User, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';
import { checkUsernameAvailability } from '../../lib/supabase/auth';

interface SignUpFormProps {
  showSignUp: boolean;
  setShowSignUp: (show: boolean) => void;
  switchToSignIn: () => void;
}

export function SignUpForm({ showSignUp, setShowSignUp, switchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const validateUsername = (value: string) => {
    if (!value) return '';
    if (value.length < 3) {
      return 'Username must be at least 6 characters';
    }
    if (value.length > 30) {
      return 'Username must be less than 30 characters';
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores and hyphens';
    }
    return '';
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    const validationError = validateUsername(value);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    if (value) {
      const isAvailable = await checkUsernameAvailability(value);
      setUsernameError(isAvailable ? '' : 'Username already taken');
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!terms) {
        setError('Please confirm you have read and accept the Terms of Service and Privacy Policy');
        return;
      }

      if (username) {
        const validationError = validateUsername(username);
        if (validationError) {
          setUsernameError(validationError);
          return;
        }

        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          setUsernameError('Username already taken');
          return;
        }
      }

      const { requiresEmailConfirmation } = await signUp(email, password, {
        username: username || email.split('@')[0]
      });

      if (requiresEmailConfirmation) {
        setShowVerificationMessage(true);
      } else {
        setShowSignUp(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal
      isOpen={showSignUp}
      onClose={() => setShowSignUp(false)}
      title={showVerificationMessage ? "Check Your Email" : "Create an Account"}
    >
      {showVerificationMessage ? (
        <div className="text-center p-6">
          <div className="flex justify-center mb-6">
            <Mail className="w-16 h-16 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Verify Your Email</h3>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <span className="font-medium">{email}</span>.
            Please check your email and click the link to verify your account.
          </p>
          <div className="text-sm text-gray-500 mt-4">
            <p>Didn't receive the email?</p>
            <button
              onClick={() => window.location.reload()}
              className="text-purple-600 hover:text-purple-700 font-medium mt-2"
            >
              Click here to try again
            </button>
          </div>
          <button
            onClick={switchToSignIn}
            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  usernameError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {usernameError && (
              <p className="mt-1 text-sm text-red-500">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                Subscribe to our newsletter
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="/terms" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToSignIn}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      )}
    </AuthModal>
  );
}