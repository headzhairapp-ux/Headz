import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogleDirect, user, isAdmin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as admin
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [loading, user, isAdmin, navigate]);

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
        // Check if user is an admin
        if (!signedInUser.is_admin) {
          setError('Access denied. You do not have admin privileges.');
          setIsLoading(false);
          return;
        }

        // Admin verified - redirect to dashboard
        navigate('/admin');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo & Admin Badge */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Headz International" className="w-12 h-12 rounded-xl object-cover" />
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Headz International
            </Link>
          </div>
          <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-full font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Admin Access
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h2>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <p className="text-gray-400 text-center text-sm mb-6">
            Sign in with your admin Google account
          </p>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <svg className="animate-spin h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-300">Authenticating...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            )}
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            Only users with admin privileges can access the dashboard.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
