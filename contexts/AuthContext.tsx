import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithGoogle,
  handleOAuthCallback,
  getOrCreateUserByEmail,
  createUserWithProfile,
  updateUserProfile,
  signOutFromSupabase,
} from '../services/supabaseService';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isFreeUser: boolean;
  setFreeUser: (isFree: boolean) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  // OAuth methods
  signInWithGoogleOAuth: () => Promise<{ error: any }>;
  checkOAuthCallback: () => Promise<{ user: any | null; isNewUser: boolean; error: any }>;
  // Direct Google Sign-In (no Supabase OAuth)
  signInWithGoogleDirect: (credential: string) => Promise<{ user: any | null; isNewUser: boolean; error: any }>;
  // Google Sign-In with Access Token (from useGoogleLogin hook)
  signInWithGoogleToken: (accessToken: string) => Promise<{ user: any | null; isNewUser: boolean; error: any }>;
  // Profile methods
  completeProfile: (
    email: string,
    firstName: string,
    lastName: string,
    location?: string,
    authProvider?: 'google'
  ) => Promise<{ user: any | null; error: any }>;
  updateProfile: (firstName: string, lastName: string, location?: string) => Promise<{ user: any | null; error: any }>;
  // Pending action for auth flow
  pendingAction: 'download' | 'share' | null;
  setPendingAction: (action: 'download' | 'share' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [pendingAction, setPendingActionState] = useState<'download' | 'share' | null>(null);

  // Load pending action from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('headz_pending_action');
    if (stored) {
      setPendingActionState(stored as 'download' | 'share');
    }
  }, []);

  // Persist pending action to sessionStorage
  const setPendingAction = useCallback((action: 'download' | 'share' | null) => {
    setPendingActionState(action);
    if (action) {
      sessionStorage.setItem('headz_pending_action', action);
    } else {
      sessionStorage.removeItem('headz_pending_action');
    }
  }, []);

  useEffect(() => {
    // Check for stored user session in localStorage
    const getInitialSession = () => {
      try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setSession({ user: userData });
          setIsAdmin(userData.is_admin || false);
          setIsSuperAdmin(userData.is_super_admin || false);
        }
      } catch (error) {
        console.error('Error loading stored session:', error);
      }
      setLoading(false);
    };

    getInitialSession();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('styleMyHair_user');
    sessionStorage.removeItem('headz_pending_action');
    sessionStorage.removeItem('headz_oauth_provider');
    await signOutFromSupabase();
    setUser(null);
    setSession(null);
    setIsFreeUser(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setPendingActionState(null);
  };

  const setFreeUser = (isFree: boolean) => {
    setIsFreeUser(isFree);
  };

  // Google OAuth Methods
  const signInWithGoogleOAuth = async (): Promise<{ error: any }> => {
    return signInWithGoogle();
  };

  const checkOAuthCallback = async (): Promise<{ user: any | null; isNewUser: boolean; error: any }> => {
    const result = await handleOAuthCallback();

    // If not a new user and we have a user, log them in
    if (!result.isNewUser && result.user) {
      localStorage.setItem('styleMyHair_user', JSON.stringify(result.user));
      setUser(result.user);
      setSession({ user: result.user });
      setIsAdmin(result.user.is_admin || false);
      setIsSuperAdmin(result.user.is_super_admin || false);
    }

    return result;
  };

  // Direct Google Sign-In (decodes Google JWT and creates/finds user)
  const signInWithGoogleDirect = async (credential: string): Promise<{ user: any | null; isNewUser: boolean; error: any }> => {
    try {
      // Decode the Google JWT credential
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);

      const email = googleUser.email;
      const firstName = googleUser.given_name || '';
      const lastName = googleUser.family_name || '';

      // Check if user exists or create new one
      const { user: existingUser, isNewUser, error: findError } = await getOrCreateUserByEmail(email);

      // Check for blocked user error
      if (findError && findError.message?.includes('blocked')) {
        return { user: null, isNewUser: false, error: findError };
      }

      if (findError) {
        return { user: null, isNewUser: false, error: findError };
      }

      if (isNewUser) {
        // Create user with Google profile info
        const { user: newUser, error: createError } = await createUserWithProfile(
          email,
          firstName,
          lastName,
          undefined,
          'google'
        );

        if (createError) {
          return { user: null, isNewUser: true, error: createError };
        }

        if (newUser) {
          localStorage.setItem('styleMyHair_user', JSON.stringify(newUser));
          setUser(newUser);
          setSession({ user: newUser });
          setIsAdmin(newUser.is_admin || false);
          setIsSuperAdmin(newUser.is_super_admin || false);
        }

        return { user: newUser, isNewUser: true, error: null };
      } else {
        // Existing user - log them in
        if (existingUser) {
          localStorage.setItem('styleMyHair_user', JSON.stringify(existingUser));
          setUser(existingUser);
          setSession({ user: existingUser });
          setIsAdmin(existingUser.is_admin || false);
          setIsSuperAdmin(existingUser.is_super_admin || false);
        }

        return { user: existingUser, isNewUser: false, error: null };
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, isNewUser: false, error: { message: 'Failed to sign in with Google' } };
    }
  };

  // Google Sign-In with Access Token (from useGoogleLogin hook)
  const signInWithGoogleToken = async (accessToken: string): Promise<{ user: any | null; isNewUser: boolean; error: any }> => {
    try {
      // Fetch user info from Google API
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await response.json();

      const email = googleUser.email;
      const firstName = googleUser.given_name || '';
      const lastName = googleUser.family_name || '';

      // Check if user exists or create new one
      const { user: existingUser, isNewUser, error: findError } = await getOrCreateUserByEmail(email);

      // Check for blocked user error
      if (findError && findError.message?.includes('blocked')) {
        return { user: null, isNewUser: false, error: findError };
      }

      if (findError) {
        return { user: null, isNewUser: false, error: findError };
      }

      if (isNewUser) {
        // Create user with Google profile info
        const { user: newUser, error: createError } = await createUserWithProfile(
          email,
          firstName,
          lastName,
          undefined,
          'google'
        );

        if (createError) {
          return { user: null, isNewUser: true, error: createError };
        }

        if (newUser) {
          localStorage.setItem('styleMyHair_user', JSON.stringify(newUser));
          setUser(newUser);
          setSession({ user: newUser });
          setIsAdmin(newUser.is_admin || false);
          setIsSuperAdmin(newUser.is_super_admin || false);
        }

        return { user: newUser, isNewUser: true, error: null };
      } else {
        // Existing user - log them in
        if (existingUser) {
          localStorage.setItem('styleMyHair_user', JSON.stringify(existingUser));
          setUser(existingUser);
          setSession({ user: existingUser });
          setIsAdmin(existingUser.is_admin || false);
          setIsSuperAdmin(existingUser.is_super_admin || false);
        }

        return { user: existingUser, isNewUser: false, error: null };
      }
    } catch (error) {
      console.error('Google token sign-in error:', error);
      return { user: null, isNewUser: false, error: { message: 'Failed to sign in with Google' } };
    }
  };

  // Profile Methods
  const completeProfile = async (
    email: string,
    firstName: string,
    lastName: string,
    location?: string,
    authProvider: 'google' = 'google'
  ): Promise<{ user: any | null; error: any }> => {
    const { user: newUser, error } = await createUserWithProfile(
      email,
      firstName,
      lastName,
      location,
      authProvider
    );

    if (newUser && !error) {
      localStorage.setItem('styleMyHair_user', JSON.stringify(newUser));
      setUser(newUser);
      setSession({ user: newUser });
      setIsAdmin(newUser.is_admin || false);
      setIsSuperAdmin(newUser.is_super_admin || false);
    }

    return { user: newUser, error };
  };

  const updateProfile = async (
    firstName: string,
    lastName: string,
    location?: string
  ): Promise<{ user: any | null; error: any }> => {
    if (!user?.id) {
      return { user: null, error: { message: 'No user logged in' } };
    }

    const { user: updatedUser, error } = await updateUserProfile(user.id, firstName, lastName, location);

    if (updatedUser && !error) {
      localStorage.setItem('styleMyHair_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSession({ user: updatedUser });
    }

    return { user: updatedUser, error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    isFreeUser,
    setFreeUser,
    isAdmin,
    isSuperAdmin,
    // OAuth methods
    signInWithGoogleOAuth,
    checkOAuthCallback,
    signInWithGoogleDirect,
    signInWithGoogleToken,
    // Profile methods
    completeProfile,
    updateProfile,
    // Pending action
    pendingAction,
    setPendingAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
