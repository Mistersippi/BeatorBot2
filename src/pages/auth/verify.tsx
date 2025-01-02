import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

export function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token_hash and type from URL to match Supabase's format
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash) {
          throw new Error('No verification token found');
        }

        // Verify using the exact token_hash from the URL
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type || 'signup'  // Using 'signup' as the default type
        });

        if (error) throw error;

        // If verification successful, show success and redirect
        toast.success('Email verified successfully!');
        setVerifying(false);
        navigate('/profile/settings');

      } catch (err) {
        console.error('Verification error:', err);
        setVerifying(false);
        toast.error('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [navigate, searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
              <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Verification Failed
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              We couldn't verify your email. Please try again or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
