import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { getSuperAdminStats, getAllUsersWithAnalytics, searchUsersWithAnalytics } from '../services/supabaseService';

interface SuperAdminStats {
  totalDownloads: number;
  totalShares: number;
  totalGenerations: number;
  maleFavoriteStyle: string | null;
  femaleFavoriteStyle: string | null;
}

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
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<SuperAdminStats>({
    totalDownloads: 0,
    totalShares: 0,
    totalGenerations: 0,
    maleFavoriteStyle: null,
    femaleFavoriteStyle: null,
  });
  const [users, setUsers] = useState<UserWithAnalytics[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithAnalytics[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/super-admin/login');
      return;
    }

    loadData();
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    // Debounced server-side search
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

  // Calculate pagination values
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData] = await Promise.all([
        getSuperAdminStats(),
        getAllUsersWithAnalytics(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error loading super admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportUsers = async () => {
    setExporting(true);
    try {
      // Filter users by date range
      let dataToExport = users;

      if (exportStartDate || exportEndDate) {
        dataToExport = users.filter(u => {
          const createdAt = new Date(u.created_at);
          if (exportStartDate && createdAt < new Date(exportStartDate)) return false;
          if (exportEndDate && createdAt > new Date(exportEndDate + 'T23:59:59')) return false;
          return true;
        });
      }

      // Build title based on date range
      let titleText = 'Headz Users';
      if (exportStartDate && exportEndDate) {
        titleText = `Headz Users from ${exportStartDate} to ${exportEndDate}`;
      } else if (exportStartDate) {
        titleText = `Headz Users from ${exportStartDate}`;
      } else if (exportEndDate) {
        titleText = `Headz Users to ${exportEndDate}`;
      }

      // Create worksheet with title row first
      const worksheet = XLSX.utils.aoa_to_sheet([[titleText]]);

      // Add data starting from row 2 (origin: 1 means row index 1)
      XLSX.utils.sheet_add_json(worksheet, dataToExport.map(u => ({
        'Name': u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name',
        'Email': u.email,
        'Downloads': u.download_count || 0,
        'Shares': u.share_count || 0,
        'Generations': u.generation_count || 0,
        'Custom Prompts': u.custom_prompt_count || 0,
        'Joined': u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
      })), { origin: 1 });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Generate filename with date range
      const dateRange = exportStartDate && exportEndDate
        ? `_${exportStartDate}_to_${exportEndDate}`
        : '';
      XLSX.writeFile(workbook, `headz_users${dateRange}.xlsx`);

      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '500/20')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const StyleCard: React.FC<{
    title: string;
    styleName: string | null;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, styleName, icon, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-xl font-bold ${color} mt-1 truncate`}>
            {styleName || 'No data yet'}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '500/20')} flex-shrink-0 ml-4`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Headz International
              </Link>
              <div className="hidden sm:flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Super Admin
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:block">
                Welcome, {user?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-400">Analytics overview across all users</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <StatCard
                title="Total Downloads"
                value={stats.totalDownloads}
                color="text-blue-500"
                icon={
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              />

              <StatCard
                title="Total Shares"
                value={stats.totalShares}
                color="text-green-500"
                icon={
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                }
              />

              <StatCard
                title="Total Generations"
                value={stats.totalGenerations}
                color="text-purple-500"
                icon={
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StyleCard
                title="Male Favorite Style"
                styleName={stats.maleFavoriteStyle}
                color="text-cyan-500"
                icon={
                  <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <StyleCard
                title="Female Favorite Style"
                styleName={stats.femaleFavoriteStyle}
                color="text-pink-500"
                icon={
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>
          </>
        )}

        {/* Search and Refresh Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchLoading && (
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
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

        {/* User Data Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-700">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
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
                    </tr>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Showing X-Y of Z users */}
                <p className="text-gray-400 text-sm">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  {filteredUsers.length !== users.length && ` (${users.length} total)`}
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
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
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
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-gray-400 text-sm px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={loadData}
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Refresh Data</h3>
                  <p className="text-gray-400 text-sm">Update stats and user list</p>
                </div>
              </div>
            </button>

            <Link
              to="/"
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 text-left group block"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">View Main App</h3>
                  <p className="text-gray-400 text-sm">Go to Headz International</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Export User Data</h3>

            {/* Date Range Filters */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">From Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">To Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExportUsers}
                disabled={exporting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white rounded-lg flex items-center justify-center space-x-2"
              >
                {exporting ? 'Exporting...' : 'Download Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
