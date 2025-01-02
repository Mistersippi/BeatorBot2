import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Debug logging
    console.log('AuthCallback: Current user state:', user);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      // Check if we have a user
      if (user) {
        console.log('AuthCallback: User authenticated, redirecting to profile');
        // User is authenticated, redirect to profile settings
        navigate('/profile/settings');
      } else {
        console.log('AuthCallback: No user after timeout, redirecting to home');
        // If no user after 5 seconds, redirect to home
        navigate('/');
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Verification</h2>
        <p className="text-gray-600">Just a moment while we verify your account...</p>
      </div>
    </div>
  );
}
