import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, isFreeUser, setFreeUser } = useAuth();

  // Auto-enable free user mode for unauthenticated users
  useEffect(() => {
    if (!loading && !user && !isFreeUser) {
      setFreeUser(true);
    }
  }, [loading, user, isFreeUser, setFreeUser]);

  if (loading || (!user && !isFreeUser)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;