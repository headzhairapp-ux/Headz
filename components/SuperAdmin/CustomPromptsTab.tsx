import React, { useState, useEffect } from 'react';
import { getUsersWithCustomPrompts, getUserCustomPrompts } from '../../services/supabaseService';

interface UserWithCustomPrompts {
  id: string;
  email: string;
  full_name: string | null;
  custom_prompt_count: number;
}

interface CustomPrompt {
  id: number;
  prompt: string;
  created_at: string;
  hairstyle_name: string | null;
}

interface CustomPromptsTabProps {
  loading: boolean;
}

const CustomPromptsTab: React.FC<CustomPromptsTabProps> = ({ loading: initialLoading }) => {
  const [users, setUsers] = useState<UserWithCustomPrompts[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userPrompts, setUserPrompts] = useState<Record<string, CustomPrompt[]>>({});
  const [loadingPrompts, setLoadingPrompts] = useState<string | null>(null);

  useEffect(() => {
    loadUsersWithCustomPrompts();
  }, []);

  const loadUsersWithCustomPrompts = async () => {
    try {
      setLoading(true);
      const data = await getUsersWithCustomPrompts();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users with custom prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);

    // Load prompts if not already cached
    if (!userPrompts[userId]) {
      setLoadingPrompts(userId);
      try {
        const prompts = await getUserCustomPrompts(userId);
        setUserPrompts((prev) => ({ ...prev, [userId]: prompts }));
      } catch (error) {
        console.error('Error loading user prompts:', error);
      } finally {
        setLoadingPrompts(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-48"></div>
                <div className="h-3 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-8 w-8 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-400">No Custom Prompts Yet</h3>
        <p className="text-gray-500 mt-2">
          Users haven&apos;t created any custom AI-generated styles yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-300">
          <span className="text-purple-400 font-semibold">{users.length}</span> users with custom
          prompts
        </p>
      </div>

      {/* User list */}
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
        >
          {/* User header - clickable to expand */}
          <button
            onClick={() => handleToggleExpand(user.id)}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors duration-200"
          >
            <div className="text-left">
              <p className="text-white font-medium">
                {user.full_name || 'Unknown User'}
              </p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                {user.custom_prompt_count} prompt{user.custom_prompt_count !== 1 ? 's' : ''}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  expandedUserId === user.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {/* Expanded content - prompts list */}
          {expandedUserId === user.id && (
            <div className="border-t border-gray-700 p-4 bg-gray-900/50">
              {loadingPrompts === user.id ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : userPrompts[user.id]?.length > 0 ? (
                <div className="space-y-3">
                  {userPrompts[user.id].map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <p className="text-gray-200 mb-2">&quot;{prompt.prompt}&quot;</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(prompt.created_at)}</span>
                        {prompt.hairstyle_name && (
                          <span className="text-purple-400">{prompt.hairstyle_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No prompts found</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomPromptsTab;
export type { CustomPromptsTabProps, UserWithCustomPrompts, CustomPrompt };
