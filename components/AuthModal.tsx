import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from './ProfileForm';

type AuthStep =
  | 'google-signin'  // Show Google button
  | 'profile-form'   // Name + Location form (for new users)
  | 'loading'        // Processing
  | 'success';       // Success state (brief)

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageCount: number;
  reason?: 'limit' | 'download' | 'share';
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  usageCount,
  reason = 'limit',
  onAuthSuccess,
}) => {
  const navigate = useNavigate();
  const {
    signInWithGoogleToken,
    completeProfile,
  } = useAuth();

  const [step, setStep] = useState<AuthStep>('google-signin');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Reset state when modal opens/closes
  const resetState = useCallback(() => {
    setStep('google-signin');
    setEmail('');
    setIsLoading(false);
    setError(null);
    setIsNewUser(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Google OAuth - Handle access token from useGoogleLogin
  const handleGoogleTokenSuccess = async (tokenResponse: any) => {
    setError(null);
    setIsLoading(true);

    try {
      const { user, isNewUser: newUser, error: signInError } = await signInWithGoogleToken(
        tokenResponse.access_token
      );

      if (signInError) {
        setError('Failed to sign in with Google. Please try again.');
        setIsLoading(false);
        return;
      }

      if (user) {
        // Check if user is a super admin and redirect accordingly
        if (user.is_super_admin) {
          navigate('/super-admin');
          handleClose();
          return;
        }
        // Normal flow for non-super-admin users
        setStep('success');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          handleClose();
        }, 500);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }

    setIsLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleTokenSuccess,
    onError: handleGoogleError,
  });

  if (!isOpen) return null;

  // Profile form submission (for new users if needed)
  const handleProfileSubmit = async (firstName: string, lastName: string, location?: string) => {
    setError(null);
    setIsLoading(true);

    const result = await completeProfile(
      email,
      firstName,
      lastName,
      location,
      'google'
    );

    setIsLoading(false);

    if (result.user && !result.error) {
      setStep('success');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        handleClose();
      }, 500);
    } else {
      setError(result.error?.message || 'Failed to save profile');
    }
  };

  // Get title based on reason
  const getTitle = () => {
    switch (reason) {
      case 'download':
        return 'Sign In to Continue';
      case 'share':
        return 'Sign In to Share';
      default:
        return 'Sign In';
    }
  };

  // Get subtitle based on reason
  const getSubtitle = () => {
    switch (reason) {
      case 'download':
        return 'Create a free account to download your styled images without watermarks';
      case 'share':
        return 'Create a free account to share your transformations';
      default:
        return 'Create a free account to get started';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-700/50 animate-slide-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step: Google Sign-In */}
        {step === 'google-signin' && (
          <>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Headz International" className="h-14 object-contain rounded-lg" />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
              {getTitle()}
            </h2>

            {/* Subtitle */}
            <p className="text-gray-300 text-center mb-6">{getSubtitle()}</p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all shadow-md border border-gray-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Maybe Later */}
            <button
              onClick={handleClose}
              className="w-full text-center text-gray-400 hover:text-gray-300 text-sm mt-4 transition-colors"
            >
              Maybe later
            </button>
          </>
        )}

        {/* Step: Profile Form (for new users needing profile completion) */}
        {step === 'profile-form' && (
          <div className="pt-4">
            <ProfileForm
              email={email}
              onSubmit={handleProfileSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}

        {/* Step: Loading */}
        {step === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300">Please wait...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome!</h3>
            <p className="text-gray-400">You're all set.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
