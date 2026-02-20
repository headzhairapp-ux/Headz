
import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  const steps = [
    "AI analyzing facial features",
    "Neural network processing",
    "Generating hairstyle transformation",
    "AI perfecting your new look",
    "Almost ready"
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 2500);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 12;
      });
    }, 600);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-lg p-6">
      {/* AI Loader Card */}
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-2xl">

        {/* AI Brain Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 w-28 h-28 border-2 border-dashed border-[#E1262D]/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>

            {/* Middle pulsing ring */}
            <div className="absolute inset-2 w-24 h-24 border-2 border-[#E1262D]/40 rounded-full animate-pulse"></div>

            {/* Inner glow circle */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-4 bg-gradient-to-br from-[#E1262D] via-[#E1262D] to-[#B91C1C] rounded-full animate-pulse shadow-lg shadow-[#E1262D]/50"></div>

              {/* AI Sparkles Icon */}
              <div className="relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Sparkle/AI icon */}
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#E1262D] rounded-full shadow-lg shadow-[#E1262D]/50"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#E1262D]/70 rounded-full shadow-lg shadow-[#E1262D]/50"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"></div>
            </div>
          </div>
        </div>

        {/* AI Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-[#E1262D] to-[#B91C1C] px-4 py-1.5 rounded-full">
            <span className="text-white text-sm font-bold tracking-wider">AI POWERED</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(90deg, #E1262D, #E1262D, #B91C1C)',
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {steps[step]}
            <span className="text-[#E1262D]">{dots}</span>
          </p>
          <div className="flex justify-center space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === step ? 'bg-[#E1262D] scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info Text */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">
            Our AI is transforming your hairstyle
          </p>
          <p className="text-gray-400 text-xs mt-1">
            This usually takes 10-30 seconds
          </p>
        </div>

        {/* Tip Box */}
        <div className="bg-gradient-to-r from-[#E1262D]/20 to-[#B91C1C]/20 rounded-xl border border-[#E1262D]/20 p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#E1262D] to-[#B91C1C] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Tip: Front-facing photos work best with our AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
