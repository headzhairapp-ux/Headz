import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Headz International" className="h-14 object-contain rounded-lg" />
          <span className="text-xl font-bold text-[#E1262D]">
            Headz International
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-900 text-sm">
              Hi, <span className="font-semibold text-[#E1262D]">{user.first_name || user.email}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-[#E1262D] hover:bg-[#B91C1C] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
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
