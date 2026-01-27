import React, { useState, useEffect } from 'react';
import UserSearchBar from './UserSearchBar';
import UserTable from './UserTable';
import ExportModal from './ExportModal';
import { searchUsersWithAnalytics } from '../../services/supabaseService';

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
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          users={users}
          onClose={() => setShowExportModal(false)}
          onError={onError}
        />
      )}
    </>
  );
};

export default UsersTab;
export type { UsersTabProps, UserWithAnalytics };
