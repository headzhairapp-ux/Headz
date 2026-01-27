
import React, { useState, useRef, useCallback, MouseEvent, TouchEvent, useEffect } from 'react';
import Loader from './Loader';

interface ImageComparatorProps {
  originalImage: string;
  styledImage: string;
  isLoading: boolean;
  children?: React.ReactNode; // For overlaying buttons
  onDownload?: () => void;
  onShare?: () => void;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, styledImage, isLoading, children, onDownload, onShare }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleTouchStart = (e: TouchEvent) => {
    isDragging.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
    };
}, [handleMouseMove, handleTouchMove, handleMouseUp, handleTouchEnd]);


  return (
    <div 
        ref={containerRef}
        className="relative w-full aspect-square bg-gray-800 rounded-lg shadow-lg overflow-hidden select-none group"
    >
      <img
        src={originalImage}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={styledImage}
          alt="Styled"
          className="absolute inset-0 w-full h-full object-cover"
          draggable="false"
        />
      </div>
      
      {/* Action Buttons: Download & Share */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
        {onDownload && (
          <button 
              onClick={onDownload} 
              className="bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm flex items-center"
              aria-label="Download styled image"
              title="Download Image"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
          </button>
        )}
        <button 
            onClick={onShare} 
            disabled={!onShare}
            className="bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Share styled image"
            title={!onShare ? "Sharing not supported in this browser" : "Share Image"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
        </button>
      </div>

      {/* Slider Handle and Line */}
      <div
        className="absolute top-0 bottom-0 w-1 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 shadow-md backdrop-blur-sm flex items-center justify-center cursor-ew-resize transition-transform duration-200 group-hover:scale-110">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
      
      {isLoading && <Loader />}
      {children}
    </div>
  );
};

export default ImageComparator;
