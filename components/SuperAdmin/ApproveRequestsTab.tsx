import React, { useState, useEffect, useMemo } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '../../services/supabaseService';

interface PendingUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  location?: string;
  country_code?: string;
  phone_number?: string;
  created_at: string;
  request_status?: string;
  request_expires_at?: string;
}

// Whole days remaining until a request expires (negative once overdue).
const daysUntil = (iso?: string): number | null => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

interface ApproveRequestsTabProps {
  onPendingCountChange: (count: number) => void;
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
      <div className="text-xs text-gray-400">{timeStr}</div>
    </>
  );
};

const ApproveRequestsTab: React.FC<ApproveRequestsTabProps> = ({ onPendingCountChange }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    action: 'approve' | 'reject';
  } | null>(null);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getPendingUsers();
      setPendingUsers(users);
      onPendingCountChange(users.length);
    } catch (err) {
      console.error('Error loading pending users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  // Client-side search filter (reversed so latest requests appear first)
  const filteredUsers = useMemo(() => {
    const reversed = [...pendingUsers].reverse();
    if (!searchQuery.trim()) return reversed;
    const query = searchQuery.toLowerCase();
    return reversed.filter(
      (u) =>
        u.email?.toLowerCase().includes(query) ||
        u.full_name?.toLowerCase().includes(query) ||
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query)
    );
  }, [pendingUsers, searchQuery]);

  const handleAction = (userId: string, userName: string, action: 'approve' | 'reject') => {
    setConfirmModal({ isOpen: true, userId, userName, action });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;

    setActionLoading(confirmModal.userId);
    try {
      if (confirmModal.action === 'approve') {
        await approveUser(confirmModal.userId);
      } else {
        await rejectUser(confirmModal.userId);
      }
      await loadPendingUsers();
    } catch (err) {
      console.error(`Error ${confirmModal.action}ing user:`, err);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  return (
    <>
      {/* Error Banner — never fail silently */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-700 font-semibold">Couldn't load pending requests</p>
            <p className="text-red-600 text-sm mt-0.5">{error}</p>
            {/Unauthorized/i.test(error) && (
              <p className="text-red-600 text-sm mt-1">
                Your session may be out of date. Try signing out and signing back in as the super admin.
              </p>
            )}
          </div>
          <button
            onClick={loadPendingUsers}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Bar */}
      {!loading && !error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-yellow-700 font-medium">
            {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} pending approval
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pending users..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E1262D] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
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
                  Location
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Requested On
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Expires In
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No pending users found matching your search.' : 'No pending approval requests.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-700 font-medium">{index + 1}</span>
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
                    <td className="px-6 py-4 text-center text-gray-500 text-sm whitespace-nowrap">
                      {u.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-sm whitespace-nowrap">
                      {u.created_at ? formatDate(u.created_at) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {(() => {
                        const days = daysUntil(u.request_expires_at);
                        if (days === null) {
                          return <span className="text-gray-400 text-sm">—</span>;
                        }
                        const expiringSoon = days <= 1;
                        return (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              expiringSoon
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {days <= 0
                              ? 'Today'
                              : `${days} day${days !== 1 ? 's' : ''}`}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleAction(u.id, u.full_name || u.email, 'approve')}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(u.id, u.full_name || u.email, 'reject')}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmModal.action === 'approve' ? 'Approve User?' : 'Reject User?'}
            </h3>
            <p className="text-gray-500 mb-6">
              {confirmModal.action === 'approve'
                ? `Are you sure you want to approve ${confirmModal.userName}? They will be able to login and use the application.`
                : `Are you sure you want to reject ${confirmModal.userName}? Their account will be permanently deleted.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading !== null}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  confirmModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {actionLoading ? 'Processing...' : confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApproveRequestsTab;
export type { ApproveRequestsTabProps };
