import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogleDirect, user, isSuperAdmin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as super admin
    if (!loading && user && isSuperAdmin) {
      navigate('/super-admin');
    }
  }, [loading, user, isSuperAdmin, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setIsLoading(true);

    try {
      const { user: signedInUser, error: signInError } = await signInWithGoogleDirect(
        credentialResponse.credential
      );

      if (signInError) {
        setError('Failed to sign in with Google. Please try again.');
        setIsLoading(false);
        return;
      }

      if (signedInUser) {
        if (signedInUser.is_super_admin) {
          // Super admin verified - redirect to dashboard
          navigate('/super-admin');
        } else {
          // Not a super admin - redirect to normal user flow
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Super admin login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E1262D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo & Super Admin Badge */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Headz International" className="w-12 h-12 rounded-xl object-cover" />
            <Link to="/" className="text-3xl font-bold text-[#E1262D]">
              Headz International
            </Link>
          </div>
          <div className="mt-2 inline-flex items-center px-3 py-1 bg-[#E1262D] text-white text-sm rounded-full font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Super Admin Access
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Super Admin Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <p className="text-gray-500 text-center text-sm mb-6">
            Sign in with your super admin Google account
          </p>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <svg className="animate-spin h-6 w-6 text-[#E1262D] mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Authenticating...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            )}
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            Only users with super admin privileges can access this dashboard.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-500 hover:text-[#E1262D] transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
