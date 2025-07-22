import React from 'react';
import { FiChevronRight, FiLogOut } from 'react-icons/fi';
import { logout } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

async function handleLogout() {
  await logout();
  useAuthStore.getState().reset();
}

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => (
  <nav
    className="fixed top-4 left-1/2 z-30 -translate-x-1/2 w-[95vw] flex items-center h-20 px-6 bg-gray-900/90 border border-gray-800 shadow-2xl rounded-2xl backdrop-blur-lg"
    style={{
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}
  >
    <button
      className="mr-4 p-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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