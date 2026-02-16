import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Headz International" className="h-14 object-contain rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Headz International
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">
              Hi, <span className="font-semibold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">{user.first_name || user.email}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
