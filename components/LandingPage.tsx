import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  // Before/After image pairs - user will add their images to /public/landing/
  const transformations = [
    { before: '/landing/before-1.jpg', after: '/landing/after-1.jpg' },
    { before: '/landing/before-2.jpg', after: '/landing/after-2.jpg' },
    { before: '/landing/before-3.jpg', after: '/landing/after-3.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Headz International" className="h-14 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Headz International
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white text-sm hidden sm:block">
                  Hi, <span className="font-semibold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">{user.first_name || user.email}</span>
                </span>
                <Link
                  to="/app"
                  className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                >
                  Open App
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Try Any Hairstyle
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              Before You Cut
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Upload your photo and see yourself with hundreds of hairstyles instantly.
            AI-powered. Free to try.
          </p>
          <Link
            to="/app"
            className="inline-block px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            Try It Free
          </Link>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-20 px-4 sm:px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Real Transformations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transformations.map((item, index) => (
              <div key={index} className="group">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-800">
                  {/* Before Image */}
                  <img
                    src={item.before}
                    alt={`Before transformation ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      const placeholder = document.createElement('div');
                      placeholder.className = 'text-gray-500 text-center p-4';
                      placeholder.innerHTML = `<div class="text-4xl mb-2">+</div><div class="text-sm">Add before-${index + 1}.jpg</div>`;
                      target.parentElement?.appendChild(placeholder);
                    }}
                  />
                  {/* After Image */}
                  <img
                    src={item.after}
                    alt={`After transformation ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Labels */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <span className="px-3 py-1 bg-black/70 rounded-full text-xs font-medium transition-opacity duration-500 group-hover:opacity-0">
                      Before
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs font-medium opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      After
                    </span>
                  </div>
                </div>
                <p className="text-center text-gray-500 text-sm mt-3">Hover to see result</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            See How It Works
          </h2>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800">
            {!videoPlaying ? (
              <>
                {/* Video Thumbnail / Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-red-800/50 flex items-center justify-center">
                  <video
                    src="/landing/demo.mp4"
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                    }}
                  />
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="text-sm">Add demo.mp4 to /public/landing/</div>
                  </div>
                </div>
              </>
            ) : (
              <video
                src="/landing/demo.mp4"
                className="w-full h-full object-cover"
                controls
                autoPlay
                onError={() => {
                  // Fallback to YouTube if local video fails
                  setVideoPlaying(false);
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-red-900/30 to-red-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Find Your Perfect Look?
          </h2>
          <p className="text-gray-400 mb-8">
            No signup required. Just upload a photo and start exploring.
          </p>
          <Link
            to="/app"
            className="inline-block px-10 py-4 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Headz International" className="h-6 object-contain" />
            <span className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Headz International
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="text-sm text-gray-600">
            v1.3 - Dec 2025
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        usageCount={0}
        reason="download"
      />
    </div>
  );
};

export default LandingPage;
