import React from 'react';
import { FiChevronRight, FiLogOut } from 'react-icons/fi';
import { logout } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

async function handleLogout() {
  await logout();
  useAuthStore.getState().reset();
}

const Navbar: React.FC<{ onSidebarToggle?: () => void }> = ({ onSidebarToggle }) => (
  <nav className="w-full flex items-center h-24 px-4 bg-gray-900/80 border-b border-gray-800 shadow z-40 sticky top-0 relative">
    <button
      className="mr-4 p-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
      onClick={onSidebarToggle}
      aria-label="Open sidebar"
    >
      <FiChevronRight size={24} />
    </button>
    <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-white">meAI Chat</span>
    <button
      className="ml-auto p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
      onClick={handleLogout}
      aria-label="Sign out"
    >
      <FiLogOut size={24} />
    </button>
  </nav>
);

export default Navbar; 