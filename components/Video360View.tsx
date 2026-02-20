import React from 'react';

interface Video360ViewProps {
  originalImage: string | null;
  styledImage: string | null;
  onTurnIntoVideo: () => void;
  isVideoGenerating: boolean;
  generatedVideoUrl: string | null;
  onGenerate360View: () => void;
  is360ViewGenerating: boolean;
  generated360VideoUrl: string | null;
  onDownload: () => void;
  onStartOver: () => void;
  onDiscard: () => void;
}

const Video360View: React.FC<Video360ViewProps> = ({
  originalImage,
  styledImage,
  onTurnIntoVideo,
  isVideoGenerating,
  generatedVideoUrl,
  onGenerate360View,
  is360ViewGenerating,
  generated360VideoUrl,
  onDownload,
  onStartOver,
  onDiscard,
}) => {
  return (
    <div className="flex-grow flex flex-col lg:flex-row bg-white text-gray-900">
      {/* Left Column - Controls */}
      <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-[#E1262D] mb-2">
              Video & 360° View
            </h2>
            <p className="text-gray-500 text-sm">
              Transform your styled image into dynamic videos and 360° rotating views
            </p>
          </div>

          {/* Video Generation Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#E1262D]/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Transition Video</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Create a smooth transition video showing the before and after transformation
            </p>
            <button
              onClick={onTurnIntoVideo}
              disabled={!originalImage || !styledImage || isVideoGenerating}
              className="w-full py-3 px-6 bg-[#E1262D] hover:bg-[#c82126] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isVideoGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Video...</span>
                </div>
              ) : (
                'Generate Transition Video'
              )}
            </button>
          </div>

          {/* 360 View Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#E1262D]/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">360° Rotation</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Generate a 360° rotating view to see your hairstyle from all angles
            </p>
            <button
              onClick={onGenerate360View}
              disabled={!styledImage || is360ViewGenerating}
              className="w-full py-3 px-6 bg-[#E1262D] hover:bg-[#c82126] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {is360ViewGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating 360° View...</span>
                </div>
              ) : (
                'Generate 360° View'
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onDownload}
              disabled={!styledImage}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300"
            >
              Download Image
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onDiscard}
                disabled={!styledImage}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-all duration-300"
              >
                Discard
              </button>
              <button
                onClick={onStartOver}
                className="flex-1 py-2 px-4 bg-[#E1262D] hover:bg-[#c82126] text-white rounded-lg transition-all duration-300"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Video Preview */}
      <div className="w-full lg:w-2/3 p-6">
        {/* Main Video Preview Area */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            {generated360VideoUrl ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>360° Rotation View</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                </svg>
                <span>Video Preview</span>
              </>
            )}
          </h3>
          <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
            {is360ViewGenerating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#E1262D]/30 border-t-[#E1262D] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#E1262D]/30 border-b-[#E1262D] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[#E1262D] font-medium">Generating 360° view...</p>
                  <p className="text-gray-400 text-sm">Creating multiple angle views</p>
                </div>
              </div>
            ) : isVideoGenerating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#E1262D]/30 border-t-[#E1262D] rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-[#E1262D] font-medium">Generating video...</p>
                  <p className="text-gray-400 text-sm">This may take a few moments</p>
                </div>
              </div>
            ) : generated360VideoUrl ? (
              <video
                controls
                loop
                autoPlay
                muted
                className="w-full h-full object-contain rounded-lg"
                poster={styledImage || undefined}
              >
                <source src={generated360VideoUrl} type="video/webm" />
                <source src={generated360VideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : generatedVideoUrl ? (
              <video
                controls
                className="w-full h-full object-contain rounded-lg"
                poster={styledImage || undefined}
              >
                <source src={generatedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex flex-col items-center space-y-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-center">
                  {!originalImage || !styledImage
                    ? 'Upload an image and apply a style first'
                    : 'Generate a video or 360° view to see your transformation'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video360View;