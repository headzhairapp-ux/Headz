import React, { useEffect, useState } from 'react';
import { getAnonymousDailyGenerations, UserDailyGeneration } from '../../services/supabaseService';

interface AnonymousGenerationsModalProps {
  onClose: () => void;
}

const AnonymousGenerationsModal: React.FC<AnonymousGenerationsModalProps> = ({ onClose }) => {
  const [days, setDays] = useState<UserDailyGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnonymousDailyGenerations();
        if (!cancelled) setDays(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load daily generations');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = days.reduce((sum, d) => sum + d.count, 0);
  const maxCount = days.reduce((max, d) => Math.max(max, d.count), 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Anonymous Generations</h3>
            <p className="text-gray-500 text-sm">Generations by users who were not logged in</p>
            <p className="text-gray-400 text-xs mt-1">
              {total} generation{total !== 1 ? 's' : ''} across {days.length} day
              {days.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-6">{error}</p>
          ) : days.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No anonymous generations recorded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {days.map((day) => (
                <li
                  key={day.date}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <span className="text-gray-700 text-sm font-medium w-36 shrink-0">
                    {day.label}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E1262D] rounded-full"
                      style={{ width: maxCount > 0 ? `${(day.count / maxCount) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                    {day.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnonymousGenerationsModal;
export type { AnonymousGenerationsModalProps };
