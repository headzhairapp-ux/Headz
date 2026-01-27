
import React, { useCallback, useState } from 'react';
import CameraCapture from './CameraCapture';

interface UploaderProps {
  onImageUpload: (file: File) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-4xl text-center">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Transform Your Look with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"> AI Magic</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Upload a photo and discover your perfect hairstyle using cutting-edge AI technology. 
            See yourself with any look instantly!
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 shadow-2xl mb-6 sm:mb-8">
          <label
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full h-64 sm:h-80 lg:h-96 border-2 border-dashed rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${
              isDragging 
                ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-blue-500/20 scale-105 shadow-2xl shadow-purple-500/25' 
                : 'border-gray-600 bg-gradient-to-br from-gray-700/50 to-gray-800/50 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-blue-500/10'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 transition-all duration-500 ${isDragging ? 'scale-110' : ''}`}>
                <svg className="w-full h-full text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
              </div>
              <p className="mb-2 sm:mb-3 text-lg sm:text-xl lg:text-2xl text-gray-300 font-semibold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-3 sm:mb-4">PNG, JPG, or WEBP (Max 10MB)</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>High Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Fast Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>AI Powered</span>
                </div>
              </div>
            </div>
            <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
          </label>
        </div>
        
        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-6 text-gray-500 uppercase text-sm font-semibold tracking-wider">Or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Camera Button */}
        <div className="mb-12">
          <button
            onClick={() => setShowCamera(true)}
            className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/25"
            aria-label="Use camera to take a photo"
          >
            <div className="p-2 rounded-xl bg-white/20 mr-4 group-hover:bg-white/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>Take Photo with Camera</span>
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-300">Get your new hairstyle in seconds with our advanced AI technology</p>
          </div>
          
          <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professional Quality</h3>
            <p className="text-gray-300">Salon-grade results that look natural and realistic</p>
          </div>
          
          <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Free Forever</h3>
            <p className="text-gray-300">No subscriptions, no hidden fees - just amazing results</p>
          </div>
        </div>
      </div>
      {showCamera && <CameraCapture onCapture={onImageUpload} onClose={() => setShowCamera(false)} />}
    </div>
  );
};

export default Uploader;