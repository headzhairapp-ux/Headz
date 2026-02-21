import React, { useState, useCallback } from 'react';
import { HistoryItem } from '../types';
import Loader from './Loader';

interface AIStyleGeneratorProps {
  originalImage: string | null;
  styledImage: string | null;
  isLoading: boolean;
  history: HistoryItem[];
  onGenerateStyle: (prompt: string) => void;
  onHistorySelect: (item: HistoryItem) => void;
  onDownload: () => void;
  onShare?: () => void;
  onStartOver: () => void;
  onDiscard: () => void;
  onTurnIntoVideo?: () => void;
  isVideoGenerating?: boolean;
  generatedVideoUrl?: string | null;
  onGenerate360View?: () => void;
  is360ViewGenerating?: boolean;
  generated360VideoUrl?: string | null;
}

const AIStyleGenerator: React.FC<AIStyleGeneratorProps> = ({
  originalImage,
  styledImage,
  isLoading,
  history,
  onGenerateStyle,
  onHistorySelect,
  onDownload,
  onShare,
  onStartOver,
  onDiscard,
  onTurnIntoVideo,
  isVideoGenerating,
  generatedVideoUrl,
  onGenerate360View,
  is360ViewGenerating,
  generated360VideoUrl,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [bangs, setBangs] = useState('');
  const [texture, setTexture] = useState('');

  const handleSubmit = useCallback(() => {
    if (!customPrompt.trim() || isLoading) return;

    let fullPrompt = customPrompt.trim();

    // Add optional attributes to the prompt
    const attributes = [hairColor, hairLength, bangs, texture].filter(Boolean);
    if (attributes.length > 0) {
      fullPrompt += ` with ${attributes.join(', ')}`;
    }

    onGenerateStyle(fullPrompt);
  }, [customPrompt, hairColor, hairLength, bangs, texture, isLoading, onGenerateStyle]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearForm = () => {
    setCustomPrompt('');
    setHairColor('');
    setHairLength('');
    setBangs('');
    setTexture('');
  };

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6 animate-fade-in">
      {/* Left: Current Image */}
      <div className="lg:col-span-1 animate-slide-in-left">
        <div className="bg-white rounded-3xl p-4 lg:p-6 h-full border border-gray-200 shadow-md">
          <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-gray-900 flex items-center">
            <div className="relative mr-2 lg:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {/* Orbiting particles around icon */}
              <div className="absolute inset-0 animate-spin">
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            My Image
          </h3>
          {originalImage ? (
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
              <img
                src={originalImage}
                alt="Current"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 border border-gray-200">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs lg:text-sm">No image uploaded</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Generated Preview with History */}
      <div className="lg:col-span-1 animate-slide-in-up">
        <div className="bg-white rounded-3xl p-4 lg:p-6 h-full border border-gray-200 shadow-md">
          <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-gray-900 flex items-center">
            <div className="relative mr-2 lg:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {/* Orbiting particles around icon */}
              <div className="absolute inset-0 animate-spin">
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            Generated Preview
          </h3>
          <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            {isLoading && <Loader />}
            {styledImage ? (
              <img
                src={styledImage}
                alt="Generated Style"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-xs lg:text-sm">{isLoading ? "Generating..." : "Enter a prompt to generate"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced History Carousel */}
          {(history?.length || 0) > 0 && (
            <div className="mt-4 lg:mt-6">
              <h4 className="text-sm lg:text-base font-semibold mb-3 text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Results
              </h4>
              <div className="flex space-x-2 lg:space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                {(history || []).slice(0, 6).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onHistorySelect(item)}
                    className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg lg:rounded-xl overflow-hidden hover:ring-2 hover:ring-[#E1262D] transition-all duration-300 transform hover:scale-105 border border-gray-200 shadow-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.styleName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Modern AI Style Generator */}
      <div className="lg:col-span-1 animate-slide-in-right">
        <div className="bg-white rounded-3xl p-4 lg:p-6 h-full border border-gray-200 shadow-md">
          <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-gray-900 flex items-center">
            <div className="relative mr-2 lg:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {/* Orbiting particles around icon */}
              <div className="absolute inset-0 animate-spin">
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#E1262D] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
            AI Style Generator
          </h3>

          {/* Modern Prompt Input */}
          <div className="mb-4 lg:mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 lg:mb-3">
              Describe your desired style
            </label>

            {/* Enhanced Tip Box */}
            <div className="mb-3 lg:mb-4 p-3 lg:p-4 bg-[#E1262D]/5 rounded-xl lg:rounded-2xl border border-[#E1262D]/20 shadow-lg">
              <div className="flex items-start">
                <div className="relative mr-2 lg:mr-3 flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* Glow effect around icon */}
                  <div className="absolute inset-0 w-4 h-4 lg:w-5 lg:h-5 bg-[#E1262D] rounded-full blur-sm opacity-0 animate-pulse"></div>
                </div>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  <strong className="text-[#E1262D]">Pro Tip:</strong> Use "Change ONLY the hairstyle to..." or "Style hair like..." to ensure only hair is modified
                </p>
              </div>
            </div>

            {/* Modern Example Prompts */}
            <div className="mb-3 lg:mb-4 p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-200 shadow-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2 lg:mb-3 flex items-center">
                <span className="relative mr-1 lg:mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 lg:h-4 lg:w-4 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* Glow effect around icon */}
                  <span className="absolute inset-0 w-3 h-3 lg:w-4 lg:h-4 bg-[#E1262D] rounded-full blur-sm opacity-0 animate-pulse"></span>
                </span>
                Example Prompts:
              </p>
              <div className="space-y-1 lg:space-y-2 text-xs text-gray-600">
                <div className="flex items-start group hover:bg-gray-100 rounded-lg p-1 transition-all duration-300 cursor-pointer" onClick={() => setCustomPrompt('Change ONLY the hairstyle to Amitabh Bachchan side-part style')}>
                  <span className="text-green-400 mr-1 lg:mr-2 mt-0.5 animate-pulse">✓</span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300">"Change ONLY the hairstyle to Amitabh Bachchan side-part style"</span>
                </div>
                <div className="flex items-start group hover:bg-gray-100 rounded-lg p-1 transition-all duration-300 cursor-pointer" onClick={() => setCustomPrompt('Apply Hrithik Roshan layered medium cut to hair only')}>
                  <span className="text-green-400 mr-1 lg:mr-2 mt-0.5 animate-pulse" style={{ animationDelay: '0.2s' }}>✓</span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300">"Apply Hrithik Roshan layered medium cut to hair only"</span>
                </div>
                <div className="flex items-start group hover:bg-gray-100 rounded-lg p-1 transition-all duration-300 cursor-pointer" onClick={() => setCustomPrompt('Style hair like Shah Rukh Khan pompadour')}>
                  <span className="text-green-400 mr-1 lg:mr-2 mt-0.5 animate-pulse" style={{ animationDelay: '0.4s' }}>✓</span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300">"Style hair like Shah Rukh Khan pompadour"</span>
                </div>
                <div className="flex items-start group hover:bg-gray-100 rounded-lg p-1 transition-all duration-300 cursor-pointer" onClick={() => setCustomPrompt("Change ONLY the hairstyle to David Beckham's 2007 faux-hawk")}>
                  <span className="text-green-400 mr-1 lg:mr-2 mt-0.5 animate-pulse" style={{ animationDelay: '0.6s' }}>✓</span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300">"Change ONLY the hairstyle to David Beckham's 2007 faux-hawk"</span>
                </div>
              </div>
            </div>

            {/* Enhanced Textarea */}
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'Change ONLY the hairstyle to Amitabh Bachchan side-part style'"
                className="w-full h-20 lg:h-24 p-3 lg:p-4 bg-gray-50 border border-gray-300 rounded-xl lg:rounded-2xl resize-none focus:ring-2 focus:ring-[#E1262D]/50 focus:border-[#E1262D] transition-all duration-300 text-sm text-gray-900 placeholder-gray-400 shadow-lg"
                disabled={isLoading}
              />
              {/* Floating particles around textarea */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl lg:rounded-2xl">
                <div className="absolute top-2 left-2 w-1 h-1 bg-[#E1262D]/30 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute top-4 right-3 w-1 h-1 bg-[#E1262D]/30 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute bottom-3 left-3 w-1 h-1 bg-[#E1262D]/30 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
              </div>
            </div>
          </div>

          {/* Modern Style Options */}
          <div className="mb-4 lg:mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 lg:mb-3 flex items-center">
              <div className="relative mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E1262D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                {/* Glow effect around icon */}
                <div className="absolute inset-0 w-4 h-4 bg-[#E1262D] rounded-full blur-sm opacity-0 animate-pulse"></div>
              </div>
              Style Options
            </h4>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 lg:mb-2">Hair Color</label>
                <select
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs lg:text-sm focus:ring-2 focus:ring-[#E1262D]/50 focus:border-[#E1262D] transition-all duration-300 text-gray-900 shadow-lg"
                  disabled={isLoading}
                >
                  <option value="">Any color</option>
                  <option value="black">Black</option>
                  <option value="dark brown">Dark Brown</option>
                  <option value="medium brown">Medium Brown</option>
                  <option value="light brown">Light Brown</option>
                  <option value="auburn">Auburn</option>
                  <option value="blonde">Blonde</option>
                  <option value="red">Red</option>
                  <option value="gray">Gray</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 lg:mb-2">Length</label>
                <select
                  value={hairLength}
                  onChange={(e) => setHairLength(e.target.value)}
                  className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs lg:text-sm focus:ring-2 focus:ring-[#E1262D]/50 focus:border-[#E1262D] transition-all duration-300 text-gray-900 shadow-lg"
                  disabled={isLoading}
                >
                  <option value="">Any length</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 lg:mb-2">Bangs</label>
                <select
                  value={bangs}
                  onChange={(e) => setBangs(e.target.value)}
                  className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs lg:text-sm focus:ring-2 focus:ring-[#E1262D]/50 focus:border-[#E1262D] transition-all duration-300 text-gray-900 shadow-lg"
                  disabled={isLoading}
                >
                  <option value="">No preference</option>
                  <option value="with bangs">With bangs</option>
                  <option value="without bangs">Without bangs</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 lg:mb-2">Texture</label>
                <select
                  value={texture}
                  onChange={(e) => setTexture(e.target.value)}
                  className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs lg:text-sm focus:ring-2 focus:ring-[#E1262D]/50 focus:border-[#E1262D] transition-all duration-300 text-gray-900 shadow-lg"
                  disabled={isLoading}
                >
                  <option value="">Any texture</option>
                  <option value="straight">Straight</option>
                  <option value="wavy">Wavy</option>
                  <option value="curly">Curly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Generate Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !customPrompt.trim()}
            className="group relative w-full bg-[#E1262D] hover:bg-[#B91C1C] text-white font-bold py-3 lg:py-4 px-4 lg:px-6 rounded-xl lg:rounded-2xl transition-all duration-500 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center mb-4 lg:mb-6 shadow-2xl hover:shadow-[#E1262D]/30 transform hover:scale-105 disabled:hover:scale-100 overflow-hidden"
          >
            <div className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Style
              </>
            )}
            </div>
          </button>

          {/* Modern Action Buttons */}
          <div className="space-y-2 lg:space-y-3">
            {styledImage && (
              <>
                <button
                  onClick={onDownload}
                  className="group relative w-full bg-[#E1262D] hover:bg-[#B91C1C] text-white font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-[#E1262D]/30 transform hover:scale-105 overflow-hidden"
                >
                  <div className="relative flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs lg:text-sm font-semibold">Download Result</span>
                </div>
              </button>
                {onShare && (
                  <button
                    onClick={onShare}
                    className="group relative w-full bg-[#E1262D] hover:bg-[#B91C1C] text-white font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-[#E1262D]/30 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="relative flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-xs lg:text-sm font-semibold">Share Result</span>
                  </div>
                </button>
                )}
                <button
                  onClick={onDiscard}
                  className="group relative w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 overflow-hidden"
                >
                  <div className="relative flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs lg:text-sm font-semibold">Discard</span>
                </div>
              </button>

              {/* Video Generation Buttons */}
              {(onTurnIntoVideo || onGenerate360View) && (
                <div className="space-y-3">
                  {/* Turn into Video Button */}
                  {onTurnIntoVideo && (
                    <button
                      onClick={onTurnIntoVideo}
                      disabled={isVideoGenerating || is360ViewGenerating}
                      className="group relative w-full bg-[#E1262D] hover:bg-[#B91C1C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-[#E1262D]/30 disabled:hover:scale-100 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="relative flex items-center justify-center">
                        {isVideoGenerating ? (
                          <svg className="animate-spin h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        <span className="text-xs lg:text-sm font-semibold">
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
                      className="group relative w-full bg-[#E1262D] hover:bg-[#B91C1C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-[#E1262D]/30 disabled:hover:scale-100 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="relative flex items-center justify-center">
                        {is360ViewGenerating ? (
                          <svg className="animate-spin h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} className="opacity-60"/>
                          </svg>
                        )}
                        <span className="text-xs lg:text-sm font-semibold">
                          {is360ViewGenerating ? 'Generating 360° View...' : '360° View'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Video Player Displays */}
              {generatedVideoUrl && (
                <div className="w-full mt-4 rounded-xl overflow-hidden border-2 border-[#E1262D]/50 shadow-2xl animate-slide-in-up">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-video object-cover bg-black"
                    aria-label="Generated hair transition video"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="bg-white border-t border-gray-200 p-2 text-center">
                    <p className="text-xs text-green-400 font-semibold">✨ Transition Video Ready!</p>
                  </div>
                </div>
              )}

              {/* 360° Video Player Display */}
              {generated360VideoUrl && (
                <div className="w-full mt-4 rounded-xl overflow-hidden border-2 border-[#E1262D]/50 shadow-2xl animate-slide-in-up">
                  <video
                    src={generated360VideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full aspect-video object-cover bg-black"
                    aria-label="Generated 360° hair view video"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="bg-white border-t border-gray-200 p-2 text-center flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E1262D] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      <circle cx="12" cy="12" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} className="opacity-50"/>
                    </svg>
                    <p className="text-xs text-[#E1262D] font-semibold">🌟 360° View Ready!</p>
                  </div>
                </div>
              )}
              </>
            )}
            <button
              onClick={onStartOver}
              className="group relative w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 lg:py-3 px-4 rounded-xl lg:rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden"
            >
              <div className="relative flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs lg:text-sm font-semibold">Start Over</span>
            </div>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStyleGenerator;
