import React from 'react';
import { HistoryItem } from '../types';

interface HistoryGalleryProps {
  history: HistoryItem[];
  onSelect: (image: string) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, onSelect }) => {
  if ((history?.length || 0) === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-8 pb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Previous Styles</h2>
      <div className="grid grid-cols-3 gap-4">
        {(history || []).map((item, index) => (
          <div
            key={index}
            className="group relative aspect-square bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => onSelect(item.imageUrl)}
            >
            <img src={item.imageUrl} alt={`History ${index + 1}: ${item.styleName}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
              <p className="text-xs font-semibold text-white truncate group-hover:whitespace-normal">{item.styleName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;
