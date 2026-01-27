import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGenerations } from '../services/supabaseService';

interface GenerationItem {
  id: string;
  created_at: string;
  styled_image_url: string;
  original_image_url: string;
  style_name: string;
  prompt: string;
}

interface GalleryProps {
  onDownload?: () => void;
  onStartOver: () => void;
  onSelectImage: (imageUrl: string, styleName: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onDownload, onStartOver, onSelectImage }) => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GenerationItem | null>(null);

  useEffect(() => {
    const loadGenerations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userGenerations = await getUserGenerations(user.id);
        setGenerations(userGenerations);
      } catch (err) {
        console.error('Error loading generations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    loadGenerations();
  }, [user]);

  const handleImageSelect = (generation: GenerationItem) => {
    setSelectedImage(generation);
    onSelectImage(generation.styled_image_url, generation.style_name);
  };

  const handleDownloadImage = (imageUrl: string, styleName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${styleName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-3">Sign In Required</h3>
          <p className="text-gray-400 mb-6">
            Sign in to save your styled images and access them from anywhere!
          </p>
          <button
            onClick={onStartOver}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-400 max-w-md mx-auto p-8">
          <p className="mb-4">Error loading gallery: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-3">Your Gallery is Empty</h3>
          <p className="text-gray-400 mb-6">
            Start creating some amazing hairstyles to build your personal collection!
          </p>
          <button
            onClick={onStartOver}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Create Your First Style
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Style Gallery
          </h2>
          <p className="text-gray-400 mt-2">
            {generations.length} saved style{generations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className={`group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${
                selectedImage?.id === generation.id 
                  ? 'border-purple-500 shadow-purple-500/25' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleImageSelect(generation)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={generation.styled_image_url}
                  alt={generation.style_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(generation.styled_image_url, generation.style_name);
                      }}
                      className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                      title="Download"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
                {selectedImage?.id === generation.id && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate">
                  {generation.style_name}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  {new Date(generation.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {generation.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Selected: <span className="text-white font-medium">{selectedImage.style_name}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDownloadImage(selectedImage.styled_image_url, selectedImage.style_name)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Deselect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;