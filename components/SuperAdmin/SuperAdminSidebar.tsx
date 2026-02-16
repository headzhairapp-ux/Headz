import React, { useState, useEffect } from 'react';

type TabType = 'home' | 'users' | 'approve-requests' | 'custom-prompts';

interface SuperAdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ activeTab, onTabChange, pendingCount }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'users' as TabType,
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'approve-requests' as TabType,
      label: 'Approve Requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'custom-prompts' as TabType,
      label: 'Custom Prompts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 h-[calc(100vh-73px)] hidden lg:block sticky top-[73px] overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="text-gray-400 text-xs uppercase">Current Date</div>
        <div className="text-white text-sm font-medium">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="text-purple-400 text-sm">
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      <nav className="p-4 space-y-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-4 px-3">
          Navigation
        </p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="font-medium flex-1 text-left">{tab.label}</span>
            {tab.id === 'approve-requests' && pendingCount !== undefined && pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

interface MobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabChange, pendingCount }) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'users' as TabType,
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'approve-requests' as TabType,
      label: 'Approvals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'custom-prompts' as TabType,
      label: 'Prompts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:hidden flex border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-3 transition-all duration-200 relative whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.icon}
          <span className="font-medium text-sm">{tab.label}</span>
          {tab.id === 'approve-requests' && pendingCount !== undefined && pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full min-w-[18px] text-center">
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export { SuperAdminSidebar, MobileTabBar };
export type { TabType, SuperAdminSidebarProps, MobileTabBarProps };
