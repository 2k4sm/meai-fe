import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../stores/useConversationStore';
import { FiTrash2, FiPlus, FiChevronLeft, FiLogOut, FiUser } from 'react-icons/fi';
import { RiMessage3Line } from 'react-icons/ri';
import { useAuthStore } from '../stores/useAuthStore';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onConversationSelect: (conversationId: number) => void;
  selectedConversationId: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, onConversationSelect, selectedConversationId }) => {
  const { user, logout } = useAuthStore();
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    deleteConversation,
  } = useConversationStore();
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createConversation(newTitle.trim());
    setNewTitle('');
    setSidebarOpen(true);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 block lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-gray-900/95 border-r border-gray-800 transition-all duration-500 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0 opacity-100 w-4/5 sm:w-2/5 md:w-[40%] md:min-w-[320px] md:max-w-md lg:w-[22%] lg:min-w-[300px] lg:max-w-lg' : '-translate-x-full opacity-0 w-0'}
          md:w-[40%] md:min-w-[320px] md:max-w-md lg:static lg:translate-x-0 lg:opacity-100 lg:w-[22%] lg:min-w-[300px] lg:max-w-lg`}
        style={{ height: '100vh' }}
      >
        <div className={`h-full flex flex-col gap-4 shadow-2xl bg-gray-900/90 transition-all duration-500 ease-in-out overflow-hidden p-4`}> 
          <div className="flex items-center justify-between mb-2 pt-3">
            <div className="flex items-center gap-4">
              <RiMessage3Line className="inline-block text-blue-400 w-7 h-7" />
              <span className="text-2xl font-extrabold text-blue-400 tracking-tight select-none">meAI</span>
            </div>
            <button className="ml-2 text-gray-400 hover:text-blue-400 focus:ring-2 focus:ring-blue-500 rounded p-1 bg-gray-900/90 lg:hidden" onClick={() => setSidebarOpen(false)} title="Collapse sidebar">
              <FiChevronLeft size={22} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2 mb-2 w-full bg-gray-800/80 rounded-lg p-2 shadow-inner border border-gray-700">
            <input
              className="flex-1 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out min-w-0 text-base sm:text-sm"
              style={{ minWidth: 0 }}
              placeholder="New conversation..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-colors duration-200 font-semibold shadow"
              disabled={loading}
              tabIndex={0}
              style={{ minWidth: 36 }}
            >
              <FiPlus />
              <span className="hidden sm:inline">New</span>
            </button>
          </form>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="text-gray-400">Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {conversations.length === 0 && !loading && <div className="text-gray-600">No conversations</div>}
            <ul className="space-y-1">
              {conversations.map(convo => (
                <li
                  key={convo.conversation_id}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition select-none border border-transparent ${selectedConversationId === convo.conversation_id ? 'bg-blue-900/60 border-blue-700' : 'hover:bg-gray-800'}`}
                  onClick={() => onConversationSelect(convo.conversation_id)}
                  style={{ minHeight: 36 }}
                >
                  <span className="truncate flex-1 text-gray-100" title={convo.title || 'Untitled'}>
                    {convo.title || 'Untitled'}
                  </span>
                  <button
                    className="ml-2 flex-shrink-0 text-red-400 hover:text-red-600 focus:ring-2 focus:ring-red-400 rounded p-1 transition-colors duration-200 bg-gray-800/60"
                    onClick={e => { e.stopPropagation(); deleteConversation(convo.conversation_id); }}
                    title="Delete"
                    tabIndex={0}
                    style={{ minWidth: 32 }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full flex-shrink-0 mt-auto">
            <div className="flex flex-col gap-2 w-full pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 w-full">
                <FiUser className="text-gray-400 w-6 h-6" />
                <div className="flex flex-col min-w-0">
                  <span className="text-gray-100 text-sm font-semibold truncate">{user?.name || 'User'}</span>
                  <span className="text-gray-400 text-xs truncate">{user?.email || ''}</span>
                </div>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition-colors duration-200 font-semibold shadow mt-2"
                onClick={logout}
                title="Logout"
              >
                <FiLogOut />
                <span className="sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 