import React, { useMemo, useState } from 'react';
import { Hairstyle, HistoryItem } from '../types';
import Loader from './Loader';
import ImageComparator from './ImageComparator';

interface VirtualMirrorProps {
  originalImage: string | null;
  styledImage: string | null;
  isLoading: boolean;
  selectedStyle: Hairstyle | null;
  styles: Hairstyle[];
  genderFilter: 'male' | 'female';
  onGenderFilterChange: (gender: 'male' | 'female') => void;
  history: HistoryItem[];
  onSelectStyle: (style: Hairstyle) => void;
  onHistorySelect: (item: HistoryItem) => void;
  onDownload: () => void;
  onShare?: () => void;
  onStartOver: () => void;
  onDiscard: () => void;
  onRequestFrontView?: () => void;
  onRequestBackView?: () => void;
  onRequestSideView?: () => void;
  onTurnIntoVideo?: () => void;
  isVideoGenerating?: boolean;
  generatedVideoUrl?: string | null;
  onGenerate360View?: () => void;
  is360ViewGenerating?: boolean;
  generated360VideoUrl?: string | null;
}

const VirtualMirror: React.FC<VirtualMirrorProps> = ({
  originalImage,
  styledImage,
  isLoading,
  selectedStyle,
  styles,
  genderFilter,
  onGenderFilterChange,
  onSelectStyle,
  onDownload,
  onShare,
  onDiscard,
  onStartOver,
  onRequestFrontView,
  onRequestBackView,
  onRequestSideView,
  history,
  onHistorySelect,
  onTurnIntoVideo,
  isVideoGenerating,
  generatedVideoUrl,
  onGenerate360View,
  is360ViewGenerating,
  generated360VideoUrl
}) => {
  const displayStyles: Hairstyle[] = useMemo(() => (styles || []), [styles]);
  const selectedStyleForHighlight = selectedStyle;
  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 animate-fade-in">
      {/* Left: Current Image Panel */}
      <div className="col-span-1">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-6 h-full border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:shadow-purple-500/10 hover:scale-[1.02]">
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4 lg:mb-6 text-gray-100 flex items-center animate-slide-in-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 lg:mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">My Image</span>
            <span className="sm:hidden">My Image</span>
          </h3>
          
          <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-600/50 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-gray-500/50">
          {originalImage ? (
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  <p className="text-xs lg:text-sm">Upload an image to begin</p>
            </div>
            </div>
          )}
        </div>

          {/* Change Image Button */}
          {originalImage && (
            <button
              onClick={onStartOver}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Change Photo</span>
            </button>
          )}
      </div>
      </div>

      {/* Center: Styled Preview Panel */}
      <div className="col-span-1">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-6 h-full border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:shadow-purple-500/10 hover:scale-[1.02]">
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4 lg:mb-6 text-gray-100 flex items-center animate-slide-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 lg:mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">Styled Preview</span>
            <span className="sm:hidden">Preview</span>
          </h3>
          
          <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-600/50 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-gray-500/50">
            {isLoading && <Loader />}
            {styledImage ? (
              <ImageComparator
                originalImage={originalImage!}
                styledImage={styledImage}
                isLoading={isLoading}
                onDownload={onDownload}
                onShare={onShare}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center animate-pulse">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-purple-500 mx-auto mb-2 lg:mb-3"></div>
                      <p className="text-xs lg:text-sm font-medium">Processing...</p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                      <p className="text-xs lg:text-sm font-medium">Select a preset style to preview</p>
                      <p className="text-xs text-gray-500">Choose from the styles on the right</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Minimal View Buttons */}
          {styledImage && onRequestFrontView && onRequestBackView && onRequestSideView && (
            <div className="mt-4 lg:mt-6">
              <h4 className="text-sm font-medium mb-3 text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Angles
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onRequestFrontView}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center py-3 px-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed border border-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-300">Front</span>
                </button>
                
                <button
                  onClick={onRequestSideView}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center py-3 px-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed border border-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-300">Side</span>
                </button>
                
                <button
                  onClick={onRequestBackView}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center py-3 px-2 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed border border-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-300">Back</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {styledImage && (
            <div className="mt-4 lg:mt-6 space-y-3 lg:space-y-4 animate-slide-in-up delay-300">{/* Download and Share buttons removed - available in image comparator */}
              
              <button
                onClick={onDiscard}
                className="w-full group relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:via-red-400 hover:to-red-600 text-white font-medium py-3 lg:py-4 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-2xl hover:shadow-red-500/40 overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-300/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                  <div className="absolute top-2 right-4 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                  <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/50 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
                  <div className="absolute bottom-2 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
                </div>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-red-400 via-red-300 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-red-700"></div>
                
                <div className="relative flex items-center justify-center">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 mr-2 group-hover:scale-125 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 w-5 h-5 lg:w-6 lg:h-6 bg-red-400 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-xs lg:text-sm font-semibold group-hover:text-red-100 transition-colors duration-300">Discard</span>
                </div>
              </button>

              {/* Video Generation Buttons */}
              {(onTurnIntoVideo || onGenerate360View) && (
                <div className="grid grid-cols-1 gap-3">
                  {/* Turn into Video Button */}
                  {onTurnIntoVideo && (
                    <button
                      onClick={onTurnIntoVideo}
                      disabled={isVideoGenerating || is360ViewGenerating}
                      className="w-full group relative bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 hover:from-purple-500 hover:via-purple-400 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 lg:py-4 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-2xl hover:shadow-purple-500/40 disabled:hover:scale-100 overflow-hidden"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-purple-300/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                        <div className="absolute top-2 right-4 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                        <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/50 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
                        <div className="absolute bottom-2 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
                      </div>
                      
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700"></div>
                      
                      <div className="relative flex items-center justify-center">
                        <div className="relative">
                          {isVideoGenerating ? (
                            <svg className="animate-spin h-5 w-5 lg:h-6 lg:w-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 mr-2 group-hover:scale-125 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                          {/* Icon glow effect */}
                          <div className="absolute inset-0 w-5 h-5 lg:w-6 lg:h-6 bg-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                        </div>
                        <span className="text-xs lg:text-sm font-semibold group-hover:text-purple-100 transition-colors duration-300">
                          {isVideoGenerating ? 'Generating Video...' : 'Turn into Video'}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* 360° View Button */}
                  {onGenerate360View && (
                    <button
                      onClick={onGenerate360View}
                      disabled={is360ViewGenerating || isVideoGenerating}
                      className="w-full group relative bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-700 hover:from-cyan-500 hover:via-cyan-400 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 lg:py-4 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-2xl hover:shadow-cyan-500/40 disabled:hover:scale-100 overflow-hidden"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-cyan-300/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-float" style={{ animationDelay: '0.2s', animationDuration: '3.2s' }}></div>
                        <div className="absolute top-2 right-4 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1.2s', animationDuration: '4.2s' }}></div>
                        <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/50 rounded-full animate-float" style={{ animationDelay: '2.2s', animationDuration: '3.7s' }}></div>
                        <div className="absolute bottom-2 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.7s', animationDuration: '4.7s' }}></div>
                      </div>
                      
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-700"></div>
                      
                      <div className="relative flex items-center justify-center">
                        <div className="relative">
                          {is360ViewGenerating ? (
                            <svg className="animate-spin h-5 w-5 lg:h-6 lg:w-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 mr-2 group-hover:scale-125 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} className="opacity-60"/>
                            </svg>
                          )}
                          {/* Icon glow effect */}
                          <div className="absolute inset-0 w-5 h-5 lg:w-6 lg:h-6 bg-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                        </div>
                        <span className="text-xs lg:text-sm font-semibold group-hover:text-cyan-100 transition-colors duration-300">
                          {is360ViewGenerating ? 'Generating 360° View...' : '360° View'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Video Player Displays */}
              {generatedVideoUrl && (
                <div className="w-full mt-4 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl animate-slide-in-up">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-square object-cover bg-black"
                    aria-label="Generated hair transition video"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="bg-gray-800/90 p-2 text-center">
                    <p className="text-xs text-green-400 font-semibold">✨ Transition Video Ready!</p>
                  </div>
                </div>
              )}

              {/* 360° Video Player Display */}
              {generated360VideoUrl && (
                <div className="w-full mt-4 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl animate-slide-in-up">
                  <video
                    src={generated360VideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-square object-cover bg-black"
                    aria-label="Generated 360° hair view video"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="bg-gray-800/90 p-2 text-center flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} className="opacity-50"/>
                    </svg>
                    <p className="text-xs text-cyan-400 font-semibold">🌟 360° View Ready!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Enhanced Preset Style Selector */}
      <div className="col-span-1 md:col-span-2 xl:col-span-1">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-6 border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:shadow-purple-500/10">
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-4 lg:mb-6 text-gray-100 flex items-center animate-slide-in-right">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            Preset Styles
          </h3>

          {/* Gender Filter Toggle */}
          <div className="flex gap-2 mb-4 animate-slide-in-right delay-50">
            <button
              onClick={() => onGenderFilterChange('male')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium
                ${genderFilter === 'male'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Male
            </button>
            <button
              onClick={() => onGenderFilterChange('female')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium
                ${genderFilter === 'female'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 3c0 0 -1 2 -1 4s1 4 1 4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3c0 0 1 2 1 4s-1 4 -1 4" />
              </svg>
              Female
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 animate-slide-in-right delay-100">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search styles..."
              className="w-full pl-10 pr-4 py-2 lg:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-sm lg:text-base"
            />
          </div>
          
          
          
          {/* Style Grid - 2x3 Layout (6 images at a time) with Scroll */}
          <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar animate-slide-in-right delay-300">
            {displayStyles.map((style, index) => {
              return (
              <button
                key={style.id}
                onClick={() => onSelectStyle(style)}
                disabled={isLoading}
                  className={`group relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 shadow-lg hover:shadow-xl animate-slide-in-up
                    ${selectedStyleForHighlight?.id === style.id ? 'border-purple-400 shadow-purple-500/25' : 'border-gray-700 hover:border-gray-600'}
                  ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                aria-label={`Select style: ${style.name}`}
              >
                  {/* Hairstyle Preview Image */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <img
                      src={style.thumbnailUrl}
                      alt={`${style.name} style preview`}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to a default image if the specific one fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/hairstyles/classic-side-part.png';
                      }}
                    />
                  </div>
                  
                  {/* Style Name Label */}
                  <div className="absolute bottom-2 left-2 right-2 z-20">
                    <p className="text-xs font-semibold text-white text-center truncate bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                      {style.name}
                    </p>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 right-2 z-20">
                {selectedStyleForHighlight?.id === style.id && isLoading && (
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                   </div>
                )}
                {selectedStyleForHighlight?.id === style.id && !isLoading && (
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                   </div>
                )}
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/10 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl"></div>
              </button>
              );
            })}
          </div>
          
          {/* Style Counter */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              {displayStyles.length} styles available
            </p>
          </div>
          
          {/* Start Over Button */}
          <div className="mt-4 animate-slide-in-right delay-400">
            <button
              onClick={onStartOver}
              className="group relative w-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 hover:from-gray-500 hover:via-gray-400 hover:to-gray-600 text-white font-semibold py-3 lg:py-4 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-gray-500/40 transform hover:scale-105 overflow-hidden"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-slate-400/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1 left-2 w-1 h-1 bg-white/60 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute bottom-1 right-2 w-1 h-1 bg-white/40 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
              </div>
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700"></div>
              
              <div className="relative flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs lg:text-sm font-semibold group-hover:text-gray-100 transition-colors duration-300">Start Over</span>
              </div>
            </button>
          </div>
        </div>
          </div>
          
      {/* Previous Styles Section - Bottom */}
      {(history?.length || 0) > 0 && (
        <div className="xl:col-span-3 mt-6 animate-slide-in-up delay-400">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-gray-700/50 shadow-2xl">
            <h4 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Previous Styles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(history || []).slice(0, 3).map((item, index) => (
            <button
                  key={index}
                  onClick={() => onHistorySelect(item)}
                  className="group relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden border-2 border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={`Previous style: ${item.styleName}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div className="flex items-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
                      <span className="text-sm font-medium truncate">{item.styleName}</span>
                    </div>
                  </div>
            </button>
              ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default VirtualMirror;
