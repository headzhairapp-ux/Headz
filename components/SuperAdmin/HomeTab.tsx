import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard, StyleCard } from './StatCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface DailyCount {
  date: string;
  fullDate: string;
  count: number;
}

export interface MonthlyCount {
  date: string;
  fullDate: string;
  count: number;
}

interface SuperAdminStats {
  totalDownloads: number;
  totalShares: number;
  totalGenerations: number;
  totalUsers: number;
  totalCustomPrompts: number;
  maleFavoriteStyle: string | null;
  femaleFavoriteStyle: string | null;
  weeklyUsers: DailyCount[];
  weeklyGenerations: DailyCount[];
  monthlyUsers: MonthlyCount[];
  monthlyGenerations: MonthlyCount[];
}

interface HomeTabProps {
  stats: SuperAdminStats;
  loading: boolean;
  onRefresh: () => void;
}

const LoadingSkeleton: React.FC = () => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    {/* Chart Skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  </>
);

const HomeTab: React.FC<HomeTabProps> = ({ stats, loading, onRefresh }) => {
  const [usersPeriod, setUsersPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [generationsPeriod, setGenerationsPeriod] = useState<'weekly' | 'monthly'>('weekly');

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Determine which data to use based on period selection
  const usersData = usersPeriod === 'weekly' ? stats.weeklyUsers : stats.monthlyUsers;
  const generationsData = generationsPeriod === 'weekly' ? stats.weeklyGenerations : stats.monthlyGenerations;

  return (
    <>
      {/* Stats Cards */}
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
          color="text-[#E1262D]"
          icon={
            <svg className="w-6 h-6 text-[#E1262D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          color="text-yellow-500"
          icon={
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Custom Prompts"
          value={stats.totalCustomPrompts}
          color="text-orange-500"
          icon={
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>

      {/* Favorite Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* New Users Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              New Users {usersPeriod === 'weekly' ? 'This Week' : 'This Month'}
            </h3>
            <select
              value={usersPeriod}
              onChange={(e) => setUsersPeriod(e.target.value as 'weekly' | 'monthly')}
              className="bg-gray-50 text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E1262D] cursor-pointer"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#111827',
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#EAB308"
                strokeWidth={2}
                dot={{ fill: '#EAB308', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#EAB308' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Generations Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-[#E1262D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Generations {generationsPeriod === 'weekly' ? 'This Week' : 'This Month'}
            </h3>
            <select
              value={generationsPeriod}
              onChange={(e) => setGenerationsPeriod(e.target.value as 'weekly' | 'monthly')}
              className="bg-gray-50 text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E1262D] cursor-pointer"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={generationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#111827',
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onRefresh}
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-5 h-5 text-[#E1262D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900 font-medium">Refresh Data</h3>
                <p className="text-gray-500 text-sm">Update stats and user list</p>
              </div>
            </div>
          </button>

          <Link
            to="/"
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300 text-left group block"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900 font-medium">View Main App</h3>
                <p className="text-gray-500 text-sm">Go to Headz International</p>
              </div>
            </div>
          </Link>

          {/* Gemini API Billing */}
          <a
            href="https://console.cloud.google.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-green-400 hover:bg-green-50 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900 font-medium group-hover:text-green-600 transition-colors">Gemini API Billing</h3>
              <p className="text-gray-500 text-sm">View usage & costs</p>
              <p className="text-yellow-600 text-xs mt-1">Open with headzhairapp@gmail.com</p>
            </div>
          </a>
        </div>
      </div>
    </>
  );
};

export default HomeTab;
export type { SuperAdminStats, HomeTabProps };
