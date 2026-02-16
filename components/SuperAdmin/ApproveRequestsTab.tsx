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
}

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
      <div className="text-xs text-gray-500">{timeStr}</div>
    </>
  );
};

const ApproveRequestsTab: React.FC<ApproveRequestsTabProps> = ({ onPendingCountChange }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
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
      const users = await getPendingUsers();
      setPendingUsers(users);
      onPendingCountChange(users.length);
    } catch (err) {
      console.error('Error loading pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  // Client-side search filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return pendingUsers;
    const query = searchQuery.toLowerCase();
    return pendingUsers.filter(
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
      {/* Summary Bar */}
      {!loading && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-yellow-300 font-medium">
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
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-16">
                  Sr No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Phone
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Location
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Requested On
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4 text-center"><div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-28"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-700 rounded w-24 ml-auto"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {searchQuery ? 'No pending users found matching your search.' : 'No pending approval requests.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-300 font-medium">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name'}
                        </span>
                        <span className="text-gray-400 text-sm">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {u.country_code && u.phone_number
                        ? `${u.country_code} ${u.phone_number}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400 text-sm whitespace-nowrap">
                      {u.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-sm whitespace-nowrap">
                      {u.created_at ? formatDate(u.created_at) : 'N/A'}
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
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {confirmModal.action === 'approve' ? 'Approve User?' : 'Reject User?'}
            </h3>
            <p className="text-gray-400 mb-6">
              {confirmModal.action === 'approve'
                ? `Are you sure you want to approve ${confirmModal.userName}? They will be able to login and use the application.`
                : `Are you sure you want to reject ${confirmModal.userName}? Their account will be permanently deleted.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
