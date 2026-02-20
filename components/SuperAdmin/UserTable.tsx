import React from 'react';

interface UserWithAnalytics {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  country_code?: string;
  phone_number?: string;
  download_count: number;
  share_count: number;
  custom_prompt_count: number;
  generation_count: number;
  created_at: string;
  sr_no?: number;
  is_blocked?: boolean;
  location?: string;
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
  const dateStr = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <>
      <div>{dateStr}</div>
      <div>{timeStr}</div>
    </>
  );
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-16">
                Sr No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Phone
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Downloads
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Shares
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Generations
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Custom Prompts
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Location
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Joined
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-center">
                    <span className="text-gray-700 font-medium">
                      {u.sr_no ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name'}
                      </span>
                      <span className="text-gray-500 text-sm">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {u.country_code && u.phone_number
                      ? `${u.country_code} ${u.phone_number}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                      {u.download_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                      {u.share_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
                      {u.generation_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
                      {u.custom_prompt_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-sm whitespace-nowrap">
                    {u.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-sm whitespace-nowrap">
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Showing X-Y of Z users */}
            <p className="text-gray-500 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCount)} of {filteredCount} users
              {filteredCount !== totalUsers && ` (${totalUsers} total)`}
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-gray-500 text-sm">
                  Per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E1262D]"
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
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors duration-200 text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-500 text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors duration-200 text-sm"
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
