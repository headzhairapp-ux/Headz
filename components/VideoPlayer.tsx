import React, { useEffect, useRef } from 'react';

const VideoPlayer: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Attempt to enter fullscreen when the component mounts
    const enterFullscreen = () => {
      if (iframeRef.current) {
        if (iframeRef.current.requestFullscreen) {
          iframeRef.current.requestFullscreen();
        }
      }
    };

    // Small delay to ensure the iframe is loaded
    const timer = setTimeout(enterFullscreen, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-screen">
        <iframe
          ref={iframeRef}
          src="https://www.youtube.com/embed/LWHnzj2kESo?autoplay=1&mute=0&controls=1&fs=1&modestbranding=1&rel=0&iv_load_policy=3"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title="Headz International Demo Video"
        />
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-900 p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm">Press F11 or click the fullscreen button on the video player</p>
        <button
          onClick={() => window.close()}
          className="mt-2 px-3 py-1 bg-[#E1262D] hover:bg-[#c82126] text-white rounded text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;