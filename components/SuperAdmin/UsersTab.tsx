import React, { useState, useEffect } from 'react';
import UserSearchBar from './UserSearchBar';
import UserTable from './UserTable';
import ExportModal from './ExportModal';
import { searchUsersWithAnalytics, toggleUserBlocked, getAllUsersWithAnalytics } from '../../services/supabaseService';

interface UserWithAnalytics {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  download_count: number;
  share_count: number;
  custom_prompt_count: number;
  generation_count: number;
  created_at: string;
  sr_no?: number;
  is_blocked?: boolean;
  location?: string;
}

interface UsersTabProps {
  users: UserWithAnalytics[];
  loading: boolean;
  onError: (message: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, loading, onError }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithAnalytics[]>(users);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    isBlocked: boolean;
  } | null>(null);

  // Update filtered users when users prop changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  // Debounced server-side search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        // Empty search - use local data
        setFilteredUsers(users);
      } else {
        // Server-side search
        setSearchLoading(true);
        try {
          const results = await searchUsersWithAnalytics(searchQuery.trim());
          setFilteredUsers(results);
        } catch (err) {
          console.error('Error searching users:', err);
          // Fall back to client-side filter on error
          const query = searchQuery.toLowerCase();
          setFilteredUsers(
            users.filter(
              (u) =>
                u.email?.toLowerCase().includes(query) ||
                u.full_name?.toLowerCase().includes(query) ||
                u.first_name?.toLowerCase().includes(query) ||
                u.last_name?.toLowerCase().includes(query)
            )
          );
        } finally {
          setSearchLoading(false);
        }
      }
      // Reset to first page when search changes
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, users]);

  // Paginate filtered users
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

  const handleBlockToggle = (userId: string, currentlyBlocked: boolean, userName: string) => {
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
      isBlocked: currentlyBlocked,
    });
  };

  const confirmBlockAction = async () => {
    if (!confirmModal) return;

    try {
      await toggleUserBlocked(confirmModal.userId, !confirmModal.isBlocked);
      // Refresh the user list
      const updatedUsers = await getAllUsersWithAnalytics();
      if (searchQuery) {
        const searched = await searchUsersWithAnalytics(searchQuery);
        setFilteredUsers(searched);
      } else {
        setFilteredUsers(updatedUsers);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <>
      {/* Search and Export Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <UserSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          loading={searchLoading}
        />
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* User Table */}
      <UserTable
        users={paginatedUsers}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalUsers={users.length}
        filteredCount={filteredUsers.length}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onBlockToggle={handleBlockToggle}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          users={users}
          onClose={() => setShowExportModal(false)}
          onError={onError}
        />
      )}

      {/* Block Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {confirmModal.isBlocked ? 'Unblock User?' : 'Block User?'}
            </h3>
            <p className="text-gray-400 mb-6">
              {confirmModal.isBlocked
                ? `Are you sure you want to unblock ${confirmModal.userName}? They will be able to login again.`
                : `Are you sure you want to block ${confirmModal.userName}? They will not be able to login until unblocked.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockAction}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  confirmModal.isBlocked
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {confirmModal.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersTab;
export type { UsersTabProps, UserWithAnalytics };
