import { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';

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
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

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

      // Generate username
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const timestamp = Date.now().toString(36).slice(-4);
      const tempUsername = `${baseUsername}_${timestamp}`;

      console.log('Attempting signup with username:', tempUsername);

      // Attempt signup directly without availability check
      const signupResult = await signUp(email, password, { 
        username: tempUsername,
        metadata: {
          newsletter: newsletter,
          signup_completed: false
        }
      });

      if (signupResult.error) {
        if (signupResult.error.message.includes('username')) {
          // If username error, try again with a different suffix
          const retryUsername = `${baseUsername}_${Math.random().toString(36).slice(-6)}`;
          console.log('Retrying signup with username:', retryUsername);
          
          const retryResult = await signUp(email, password, {
            username: retryUsername,
            metadata: {
              newsletter: newsletter,
              signup_completed: false
            }
          });
          
          if (retryResult.error) {
            throw retryResult.error;
          }
          
          if (retryResult.requiresEmailConfirmation) {
            setShowVerificationMessage(true);
          }
        } else {
          throw signupResult.error;
        }
      } else if (signupResult.requiresEmailConfirmation) {
        setShowVerificationMessage(true);
      } else {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNewsletter(false);
        setTerms(false);
      }
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
            <h3 className="font-semibold text-purple-800 mb-2">Next steps:</h3>
            <ol className="list-decimal list-inside text-purple-700 space-y-2">
              <li>Open your email inbox</li>
              <li>Look for an email from BeatorBot</li>
              <li>Click the verification link in the email</li>
            </ol>
          </div>

          <div className="text-sm text-gray-500">
            <p>Can't find the email? Check your spam folder or click below to resend.</p>
            <button
              onClick={() => {
                // TODO: Implement resend verification email
                console.log('Resend verification email');
              }}
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
    </AuthModal>
  );
}