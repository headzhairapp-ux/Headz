import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSuperAdminStats, getAllUsersWithAnalytics, getWeeklyUserRegistrations, getWeeklyGenerations, getMonthlyUserRegistrations, getMonthlyGenerations, getPendingApprovalCount } from '../services/supabaseService';
import {
  SuperAdminSidebar,
  MobileTabBar,
  HomeTab,
  UsersTab,
  CustomPromptsTab,
  ApproveRequestsTab,
  type TabType,
  type SuperAdminStats as StatsType,
  type UserWithAnalytics,
} from './SuperAdmin';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [stats, setStats] = useState<StatsType>({
    totalDownloads: 0,
    totalShares: 0,
    totalGenerations: 0,
    totalUsers: 0,
    totalCustomPrompts: 0,
    maleFavoriteStyle: null,
    femaleFavoriteStyle: null,
    weeklyUsers: [],
    weeklyGenerations: [],
    monthlyUsers: [],
    monthlyGenerations: [],
  });
  const [users, setUsers] = useState<UserWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/super-admin/login');
      return;
    }

    loadData();
  }, [isSuperAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData, weeklyUsersData, weeklyGenerationsData, monthlyUsersData, monthlyGenerationsData, pendingCountData] = await Promise.all([
        getSuperAdminStats(),
        getAllUsersWithAnalytics(),
        getWeeklyUserRegistrations(),
        getWeeklyGenerations(),
        getMonthlyUserRegistrations(),
        getMonthlyGenerations(),
        getPendingApprovalCount().catch(() => 0),
      ]);

      setStats({
        ...statsData,
        weeklyUsers: weeklyUsersData,
        weeklyGenerations: weeklyGenerationsData,
        monthlyUsers: monthlyUsersData,
        monthlyGenerations: monthlyGenerationsData,
      });
      setUsers(usersData);
      setPendingCount(pendingCountData);
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

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="Headz International" className="h-14 object-contain rounded-lg" />
                <span className="text-2xl font-bold text-[#E1262D]">
                  Headz International
                </span>
              </Link>
              <div className="hidden sm:flex items-center px-3 py-1 bg-[#E1262D] text-white text-sm rounded-full font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Super Admin
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">
                Welcome, {user?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-[#E1262D] hover:bg-[#B91C1C] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} />

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <SuperAdminSidebar activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} />

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'home' && 'Super Admin Dashboard'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'approve-requests' && 'Approve Requests'}
              {activeTab === 'custom-prompts' && 'Custom Prompts'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'home' && 'Analytics overview across all users'}
              {activeTab === 'users' && 'View and manage user data'}
              {activeTab === 'approve-requests' && 'Review and approve new user registrations'}
              {activeTab === 'custom-prompts' && 'View custom AI prompts created by users'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-600 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'home' && (
            <HomeTab stats={stats} loading={loading} onRefresh={loadData} />
          )}
          {activeTab === 'users' && (
            <UsersTab users={users} loading={loading} onError={handleError} />
          )}
          {activeTab === 'approve-requests' && (
            <ApproveRequestsTab onPendingCountChange={setPendingCount} />
          )}
          {activeTab === 'custom-prompts' && (
            <CustomPromptsTab loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
