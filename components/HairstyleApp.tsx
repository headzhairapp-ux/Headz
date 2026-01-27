import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './Header';
import Uploader from './Uploader';
import TabSelector, { TabType } from './TabSelector';
import VirtualMirror from './VirtualMirror';
import AIStyleGenerator from './AIStyleGenerator';
import Gallery from './Gallery';
import AuthWrapper from './AuthWrapper';
import AuthModal from './AuthModal';
import ProfileForm from './ProfileForm';
import { AVAILABLE_HAIRSTYLES } from '../constants';
import { Hairstyle, HistoryItem } from '../types';
import { editImageWithGemini, editImageWithReference } from '../services/geminiService';
import { uploadImage, saveGeneration, dataURLtoFile, trackDownload, trackShare, trackGeneration, trackCustomPrompt } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { addStylishWatermark } from '../utils/watermark';

const HairstyleApp: React.FC = () => {
  const {
    user,
    isFreeUser,
    checkOAuthCallback,
    pendingAction,
    setPendingAction,
    completeProfile,
  } = useAuth();
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [currentStyledImage, setCurrentStyledImage] = useState<string | null>(null);
  const [cleanStyledImage, setCleanStyledImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<Hairstyle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [previousStyleName, setPreviousStyleName] = useState<string | null>(null);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string | null>(null);
  const [lastUsedStyleName, setLastUsedStyleName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('virtual-mirror');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<'limit' | 'download' | 'share'>('limit');
  const [genderFilter, setGenderFilter] = useState<'male' | 'female'>('male');

  // OAuth callback state
  const [showOAuthProfileModal, setShowOAuthProfileModal] = useState(false);
  const [oauthUserData, setOAuthUserData] = useState<{
    email: string;
    supabaseUserId?: string;
  } | null>(null);

  // Handle OAuth callback on mount
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Check if we're returning from OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      // Supabase OAuth adds tokens to URL hash
      if (hashParams.get('access_token') || urlParams.get('code')) {
        try {
          const result = await checkOAuthCallback();

          if (result.user) {
            if (result.isNewUser) {
              // New user - show profile form
              setOAuthUserData({
                email: result.user.email,
                supabaseUserId: result.user.supabase_user_id,
              });
              setShowOAuthProfileModal(true);
            } else {
              // Existing user - execute pending action if any
              if (pendingAction) {
                executePendingAction();
              }
            }
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('OAuth callback error:', err);
        }
      }
    };

    handleOAuthRedirect();
  }, [checkOAuthCallback]);

  // Restore styled image from sessionStorage after OAuth redirect
  useEffect(() => {
    const storedImage = sessionStorage.getItem('headz_styled_image');
    if (storedImage && !currentStyledImage) {
      // Stored image is clean version - store it and create watermarked for display
      setCleanStyledImage(storedImage);
      addStylishWatermark(storedImage).then(watermarked => {
        setCurrentStyledImage(watermarked);
      });
      // Don't remove yet - let handleAuthSuccess use it, then it will clean up
    }
  }, [currentStyledImage]);

  useEffect(() => {
    let sid = localStorage.getItem('headz-session-id');
    if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem('headz-session-id', sid);
    }
    setSessionId(sid);
  }, []);

  const userImageUrl = useMemo(() => {
    return userImageFile ? URL.createObjectURL(userImageFile) : null;
  }, [userImageFile]);

  const filteredStyles = useMemo(() => {
    return AVAILABLE_HAIRSTYLES.filter(style => style.gender === genderFilter);
  }, [genderFilter]);

  // Execute pending action (download or share) - storedImage is clean version
  const executePendingAction = useCallback(async () => {
    const action = sessionStorage.getItem('headz_pending_action');
    const storedCleanImage = sessionStorage.getItem('headz_styled_image');

    if (action && storedCleanImage) {
      // Store clean version and watermark for display
      setCleanStyledImage(storedCleanImage);
      const watermarked = await addStylishWatermark(storedCleanImage);
      setCurrentStyledImage(watermarked);

      // Execute the action after a short delay with clean image
      setTimeout(() => {
        if (action === 'download') {
          const link = document.createElement('a');
          link.href = storedCleanImage;
          link.download = 'headz-style.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (action === 'share' && navigator.share) {
          const file = dataURLtoFile(storedCleanImage, 'headz-style.png');
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              title: 'My New Look!',
              text: 'Check out my new hairstyle from Headz International!',
              files: [file],
            }).catch(console.error);
          }
        }

        // Clear pending action
        sessionStorage.removeItem('headz_pending_action');
        sessionStorage.removeItem('headz_styled_image');
        setPendingAction(null);
      }, 500);
    }
  }, [setPendingAction]);

  // Handle OAuth profile form submission
  const handleOAuthProfileSubmit = async (firstName: string, lastName: string, location?: string) => {
    if (!oauthUserData) return;

    try {
      const result = await completeProfile(
        oauthUserData.email,
        firstName,
        lastName,
        location,
        'google'
      );

      if (result.user && !result.error) {
        setShowOAuthProfileModal(false);
        setOAuthUserData(null);

        // Execute pending action if any
        executePendingAction();
      }
    } catch (err) {
      console.error('Profile completion error:', err);
    }
  };

  const handleImageUpload = (file: File) => {
    setUserImageFile(file);
    setCurrentStyledImage(null);
    setCleanStyledImage(null);
    setHistory([]);
    setSelectedStyle(null);
    setError(null);
    setPreviousStyleName(null);
    setLastUsedPrompt(null);
    setLastUsedStyleName(null);
    setActiveTab('virtual-mirror');
  };

  const applyStyleAndSave = useCallback(async (prompt: string, styleName: string, styleId: string, thumbnailUrl?: string) => {
    if (!userImageFile || isLoading || !sessionId) return;

    setIsLoading(true);
    setError(null);
    setLastUsedPrompt(prompt);
    setLastUsedStyleName(styleName.replace(/ \((Front|Side|Back) View\)/, ''));

    try {
      // Use the most recent image (styled if available) as the base, so beard/mustache or hair can stack
      const baseImageFile = currentStyledImage
        ? dataURLtoFile(currentStyledImage, `base-${Date.now()}.png`)
        : userImageFile;

      // If thumbnailUrl is provided, use reference image approach for exact style matching
      let newStyledImage: string;
      if (thumbnailUrl) {
        newStyledImage = await editImageWithReference(baseImageFile, thumbnailUrl, styleName);
      } else {
        newStyledImage = await editImageWithGemini(baseImageFile, prompt);
      }

      // Store clean image for authenticated users to download
      const cleanImage = newStyledImage;
      setCleanStyledImage(cleanImage);

      // Always watermark for display (everyone sees watermarked preview)
      const watermarkedImage = await addStylishWatermark(newStyledImage);

      // Use clean image for DB storage (authenticated users only)
      const styledImageFile = dataURLtoFile(cleanImage, `styled-${styleId}-${userImageFile.name}`);

      // Only upload and save for authenticated users
      if (user && !isFreeUser) {
        const originalImageUrl = await uploadImage(userImageFile, sessionId);
        const styledImageUrl = await uploadImage(styledImageFile, sessionId);

        await saveGeneration({
            sessionId,
            originalImageUrl,
            styledImageUrl,
            prompt,
            styleName,
            gender: genderFilter
        });

        // Track generation count
        if (user.id) {
          trackGeneration(user.id).catch(console.error);
        }

        if (currentStyledImage && previousStyleName) {
          setHistory(prev => [{ imageUrl: currentStyledImage, styleName: previousStyleName }, ...prev].slice(0, 3));
        }
      }

      // Set watermarked image for display (everyone sees watermarked preview)
      setCurrentStyledImage(watermarkedImage);
      setPreviousStyleName(styleName);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes("Bucket not found")) {
          setError("Supabase Configuration Error: The 'images' storage bucket was not found. Please create a new public bucket named 'images' in your Supabase project's Storage section.");
        } else if (
            (err.message.includes('relation') && err.message.includes('does not exist')) ||
            err.message.includes("Could not find the table 'public.generations'")
          ) {
            const sqlToCreateTable = `
CREATE TABLE public.generations (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_id TEXT,
  original_image_url TEXT,
  styled_image_url TEXT,
  prompt TEXT,
  style_name TEXT
);
`.trim();
            setError(
`Supabase Configuration Error: The 'generations' table was not found.
Please create it by running the following SQL in your Supabase project's SQL Editor:

${sqlToCreateTable}`
            );
        } else {
            setError(err.message);
        }
      } else {
        setError("An unknown error occurred during styling or saving.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userImageFile, isLoading, currentStyledImage, sessionId, previousStyleName, user, isFreeUser]);

  const handleStyleSelect = useCallback(async (style: Hairstyle) => {
    if (isLoading) return;
    setSelectedStyle(style);

    // Use the thumbnail image as reference for exact style matching
    await applyStyleAndSave(style.prompt, style.name, style.id, style.thumbnailUrl);
  }, [applyStyleAndSave, isLoading]);

  const handleCustomPromptSubmit = useCallback(async (prompt: string) => {
    if (isLoading) return;
    setSelectedStyle(null);
    const styleName = `Custom Style`;
    await applyStyleAndSave(prompt, styleName, 'custom');
  }, [applyStyleAndSave, isLoading]);

  const handleAIStyleGeneration = useCallback(async (prompt: string) => {
    if (isLoading) return;
    setSelectedStyle(null);
    const styleName = `AI Generated Style`;

    // Track custom prompt usage if user is logged in
    if (user?.id) {
      trackCustomPrompt(user.id).catch(console.error);
    }

    await applyStyleAndSave(prompt, styleName, 'ai-generated');
  }, [applyStyleAndSave, isLoading, user]);

  const handleRequestFrontView = useCallback(async () => {
    if (!lastUsedPrompt || !lastUsedStyleName || isLoading) return;
    const prompt = `${lastUsedPrompt}, show the front view.`;
    const styleName = `${lastUsedStyleName} (Front View)`;
    await applyStyleAndSave(prompt, styleName, selectedStyle?.id || 'custom-front');
  }, [lastUsedPrompt, lastUsedStyleName, selectedStyle, applyStyleAndSave, isLoading]);

  const handleRequestSideView = useCallback(async () => {
    if (!lastUsedPrompt || !lastUsedStyleName || isLoading) return;
    const prompt = `${lastUsedPrompt}, show a side view.`;
    const styleName = `${lastUsedStyleName} (Side View)`;
    await applyStyleAndSave(prompt, styleName, selectedStyle?.id || 'custom-side');
  }, [lastUsedPrompt, lastUsedStyleName, selectedStyle, applyStyleAndSave, isLoading]);

  const handleRequestBackView = useCallback(async () => {
    if (!lastUsedPrompt || !lastUsedStyleName || isLoading) return;
    const prompt = `${lastUsedPrompt}, show a back view.`;
    const styleName = `${lastUsedStyleName} (Back View)`;
    await applyStyleAndSave(prompt, styleName, selectedStyle?.id || 'custom-back');
  }, [lastUsedPrompt, lastUsedStyleName, selectedStyle, applyStyleAndSave, isLoading]);

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentStyledImage(item.imageUrl);
  };

  const handleGalleryImageSelect = useCallback((imageUrl: string, styleName: string) => {
    setCurrentStyledImage(imageUrl);
    setLastUsedStyleName(styleName);
    // Switch to virtual-mirror tab to show the selected image
    setActiveTab('virtual-mirror');
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentStyledImage) return;

    // Check if user is authenticated - require auth for download
    if (!user) {
      // Store the clean image before showing modal (for OAuth redirect)
      if (cleanStyledImage) {
        sessionStorage.setItem('headz_styled_image', cleanStyledImage);
      }
      setAuthModalReason('download');
      setShowAuthModal(true);
      return;
    }

    // Track download if user is logged in
    if (user?.id) {
      trackDownload(user.id).catch(console.error);
    }

    // Authenticated users get the clean (no watermark) image
    const downloadImage = cleanStyledImage || currentStyledImage;
    const link = document.createElement('a');
    link.href = downloadImage;
    link.download = 'headz-style.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentStyledImage, cleanStyledImage, user]);

  const handleShare = useCallback(async () => {
    if (!currentStyledImage || !navigator.share) return;

    // Check if user is authenticated - require auth for share
    if (!user) {
      // Store the clean image before showing modal (for OAuth redirect)
      if (cleanStyledImage) {
        sessionStorage.setItem('headz_styled_image', cleanStyledImage);
      }
      setAuthModalReason('share');
      setShowAuthModal(true);
      return;
    }

    try {
      // Authenticated users share the clean (no watermark) image
      const shareImage = cleanStyledImage || currentStyledImage;
      const file = dataURLtoFile(shareImage, 'headz-style.png');
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My New Look!',
          text: 'Check out my new hairstyle from Headz International!',
          files: [file],
        });
        // Track share if user is logged in
        if (user?.id) {
          trackShare(user.id).catch(console.error);
        }
      } else {
        setError("Your browser doesn't support sharing files.");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if ((error as DOMException).name !== 'AbortError') {
        setError("Couldn't share the image. Please try again or download it instead.");
      }
    }
  }, [currentStyledImage, cleanStyledImage, user]);

  // Handle auth success - execute the pending action with clean image
  const handleAuthSuccess = useCallback(() => {
    // Use clean image for authenticated users (stored in sessionStorage or from state)
    const storedCleanImage = sessionStorage.getItem('headz_styled_image');
    const imageToUse = storedCleanImage || cleanStyledImage;

    if (imageToUse) {
      if (authModalReason === 'download') {
        const link = document.createElement('a');
        link.href = imageToUse;
        link.download = 'headz-style.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (authModalReason === 'share' && navigator.share) {
        const file = dataURLtoFile(imageToUse, 'headz-style.png');
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'My New Look!',
            text: 'Check out my new hairstyle from Headz International!',
            files: [file],
          }).catch(console.error);
        }
      }
    }
    // Clear stored image
    sessionStorage.removeItem('headz_styled_image');
  }, [cleanStyledImage, authModalReason]);

  const handleStartOver = useCallback(() => {
    setUserImageFile(null);
    setCurrentStyledImage(null);
    setCleanStyledImage(null);
    setHistory([]);
    setSelectedStyle(null);
    setError(null);
    setPreviousStyleName(null);
    setLastUsedPrompt(null);
    setLastUsedStyleName(null);
  }, []);

  const handleDiscard = useCallback(() => {
    setCurrentStyledImage(null);
    setCleanStyledImage(null);
    setSelectedStyle(null);
    setError(null);
  }, []);

  if (!userImageFile) {
    return (
      <AuthWrapper>
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Uploader onImageUpload={handleImageUpload} />
            </main>
        </div>

        {/* OAuth Profile Modal */}
        {showOAuthProfileModal && oauthUserData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-700/50">
              <ProfileForm
                email={oauthUserData.email}
                onSubmit={handleOAuthProfileSubmit}
              />
            </div>
          </div>
        )}
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Header />
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-grow flex flex-col overflow-y-auto">
        {activeTab === 'virtual-mirror' ? (
          <VirtualMirror
            originalImage={userImageUrl}
            styledImage={currentStyledImage}
            isLoading={isLoading}
            selectedStyle={selectedStyle}
            styles={filteredStyles}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            onSelectStyle={handleStyleSelect}
            onDownload={handleDownload}
            onShare={!!navigator.share ? handleShare : undefined}
            onStartOver={handleStartOver}
            onDiscard={handleDiscard}
            onRequestFrontView={handleRequestFrontView}
            onRequestBackView={handleRequestBackView}
            onRequestSideView={handleRequestSideView}
            history={history}
            onHistorySelect={handleHistorySelect}
          />
        ) : activeTab === 'ai-generator' ? (
          <AIStyleGenerator
            originalImage={userImageUrl}
            styledImage={currentStyledImage}
            isLoading={isLoading}
            history={history}
            onGenerateStyle={handleAIStyleGeneration}
            onHistorySelect={handleHistorySelect}
            onDownload={handleDownload}
            onShare={!!navigator.share ? handleShare : undefined}
            onStartOver={handleStartOver}
            onDiscard={handleDiscard}
          />
        ) : (
          <Gallery
            onDownload={handleDownload}
            onStartOver={handleStartOver}
            onSelectImage={handleGalleryImageSelect}
          />
        )}
        {error && (
          <div className="mx-8 mb-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
            <p className="font-bold">Error:</p>
            <p className="text-sm whitespace-pre-wrap font-mono">{error}</p>
          </div>
        )}
      </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        usageCount={0}
        reason={authModalReason}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* OAuth Profile Modal */}
      {showOAuthProfileModal && oauthUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-700/50">
            <ProfileForm
              email={oauthUserData.email}
              onSubmit={handleOAuthProfileSubmit}
            />
          </div>
        </div>
      )}
    </AuthWrapper>
  );
};

export default HairstyleApp;
