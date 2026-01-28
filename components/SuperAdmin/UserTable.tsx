import React from 'react';

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
}

interface UserTableProps {
  users: UserWithAnalytics[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalUsers: number;
  filteredCount: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  onBlockToggle: (userId: string, currentlyBlocked: boolean, userName: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  currentPage,
  itemsPerPage,
  totalUsers,
  filteredCount,
  searchQuery,
  onPageChange,
  onItemsPerPageChange,
  onBlockToggle,
}) => {
  const totalPages = Math.ceil(filteredCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-700">
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">
                Sr No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Downloads
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Generations
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Custom Prompts
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4 text-center">
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-700 rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-6 bg-gray-700 rounded-full w-16 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-4 text-center">
                    <span className="text-gray-300 font-medium">
                      {u.sr_no ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name'}
                      </span>
                      <span className="text-gray-400 text-sm">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-blue-400 bg-blue-500/20 rounded-full">
                      {u.download_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-green-400 bg-green-500/20 rounded-full">
                      {u.share_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-purple-400 bg-purple-500/20 rounded-full">
                      {u.generation_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-orange-400 bg-orange-500/20 rounded-full">
                      {u.custom_prompt_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 text-sm">
                    {u.created_at ? formatDate(u.created_at) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onBlockToggle(u.id, u.is_blocked || false, u.full_name || u.email)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        u.is_blocked
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {u.is_blocked ? 'Blocked' : 'Active'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      {!loading && filteredCount > 0 && (
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Showing X-Y of Z users */}
            <p className="text-gray-400 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCount)} of {filteredCount} users
              {filteredCount !== totalUsers && ` (${totalUsers} total)`}
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-gray-400 text-sm">
                  Per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
export type { UserWithAnalytics, UserTableProps };
