
import React, { useState } from 'react';
import { Hairstyle } from '../types';

interface StyleSelectorProps {
  styles: Hairstyle[];
  selectedStyleId: string | null;
  onSelectStyle: (style: Hairstyle) => void;
  isProcessing: boolean;
  onCustomPromptSubmit: (prompt: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyleId, onSelectStyle, isProcessing, onCustomPromptSubmit }) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleCustomSubmit = () => {
    if (customPrompt.trim() && !isProcessing) {
      onCustomPromptSubmit(customPrompt.trim());
      setCustomPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCustomSubmit();
    }
  };

  return (
    <aside className="bg-white border-l border-gray-200 p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Select a Style</h2>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <div className="grid grid-cols-2 gap-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              disabled={isProcessing}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#E1262D] bg-gray-50
                ${selectedStyleId === style.id ? 'border-[#E1262D]' : 'border-transparent hover:border-gray-300'}
                ${isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              aria-label={`Select style: ${style.name}`}
            >
              <img src={style.thumbnailUrl} alt={style.name} className="w-full h-full object-contain p-2" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <p className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white text-center">{style.name}</p>
              {selectedStyleId === style.id && isProcessing && (
                 <div className="absolute top-2 right-2 w-5 h-5 bg-[#E1262D] rounded-full flex items-center justify-center">
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
              )}
              {selectedStyleId === style.id && !isProcessing && (
                 <div className="absolute top-2 right-2 w-5 h-5 bg-[#E1262D] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Or, Create Your Own</h3>
            <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'A vibrant blue mohawk with shaved sides'"
                className="w-full h-24 p-2 bg-white border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-[#E1262D] focus:border-[#E1262D] transition-colors text-sm text-gray-900"
                disabled={isProcessing}
                aria-label="Custom hairstyle prompt"
            />
            <button
                onClick={handleCustomSubmit}
                disabled={isProcessing || !customPrompt.trim()}
                className="w-full mt-3 bg-[#E1262D] hover:bg-[#c82128] text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center"
            >
              {isProcessing && selectedStyleId === null ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : 'Generate Style'}
            </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">More styles coming soon!</p>
    </aside>
  );
};

export default StyleSelector;
