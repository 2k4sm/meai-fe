import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../stores/useConversationStore';
import { FaChevronLeft, FaPlus, FaTrashAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
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
        className={`fixed top-0 left-0 z-50 h-screen bg-[#2A2E24]/95 border-r border-[#697565]/30 transition-all duration-500 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0 opacity-100 w-4/5 sm:w-2/5 md:w-[40%] md:min-w-[320px] md:max-w-md lg:w-[22%] lg:min-w-[300px] lg:max-w-lg' : '-translate-x-full opacity-0 w-0'}
          md:w-[40%] md:min-w-[320px] md:max-w-md lg:static lg:translate-x-0 lg:opacity-100 lg:w-[22%] lg:min-w-[300px] lg:max-w-lg`}
        style={{ height: '100vh' }}
      >
        <div className={`h-full flex flex-col gap-4 shadow-2xl bg-[#2A2E24]/90 transition-all duration-500 ease-in-out overflow-hidden p-4`}> 
          <div className="flex items-center justify-between mb-2 pt-3">
            <div className="flex items-center gap-4">
              <RiMessage3Line className="inline-block text-[#ECDFCC] w-7 h-7 drop-shadow-[0_0_8px_rgba(236,223,204,0.3)]" />
              <span className="text-2xl font-extrabold text-[#ECDFCC] tracking-tight select-none drop-shadow-[0_0_8px_rgba(236,223,204,0.2)]">meAI</span>
            </div>
            <button 
              className="ml-2 text-[#ECDFCC] hover:text-[#ECDFCC] hover:bg-[#697565] focus:ring-2 focus:ring-[#697565] rounded-lg p-2 bg-[#3C3D37] lg:hidden transition-all duration-200 shadow-lg hover:shadow-[0_0_15px_rgba(105,117,101,0.3)]" 
              onClick={() => setSidebarOpen(false)} 
              title="Collapse sidebar"
            >
              <FaChevronLeft className="w-5 h-5 drop-shadow-[0_0_4px_rgba(236,223,204,0.3)]" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2 mb-2 w-full bg-[#3C3D37] rounded-lg p-2 shadow-lg border border-[#697565]/30">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-[#2A2E24] border border-[#697565]/30 text-[#ECDFCC] placeholder-[#697565] focus:outline-none focus:border-[#8B9A83] focus:ring-2 focus:ring-[#697565]/50 transition-all duration-300 ease-in-out min-w-0 text-base sm:text-sm shadow-inner"
              style={{ minWidth: 0 }}
              placeholder="New conversation..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center gap-1 bg-[#697565] text-[#ECDFCC] px-4 py-2 rounded-lg hover:bg-[#8B9A83] focus:ring-2 focus:ring-[#8B9A83] transition-all duration-200 font-semibold shadow-lg hover:shadow-[0_0_15px_rgba(139,154,131,0.3)] disabled:opacity-50 disabled:hover:bg-[#697565] group"
              disabled={loading}
              tabIndex={0}
              style={{ minWidth: 36 }}
            >
              <FaPlus className="w-4 h-4 drop-shadow-[0_0_4px_rgba(236,223,204,0.3)] group-hover:rotate-90 transition-transform duration-200" />
              <span className="hidden sm:inline">New</span>
            </button>
          </form>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="text-[#D4C5B3]">Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {conversations.length === 0 && !loading && <div className="text-[#697565]">No conversations</div>}
            <ul className="space-y-2">
              {conversations.map(convo => (
                <li
                  key={convo.conversation_id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 select-none border ${
                    selectedConversationId === convo.conversation_id 
                    ? 'bg-[#697565] border-[#8B9A83] shadow-[0_0_15px_rgba(105,117,101,0.2)]' 
                    : 'hover:bg-[#3C3D37] border-transparent hover:border-[#697565]/30 hover:shadow-lg'
                  }`}
                  onClick={() => onConversationSelect(convo.conversation_id)}
                  style={{ minHeight: 36 }}
                >
                  <span className={`truncate flex-1 max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis ${
                    selectedConversationId === convo.conversation_id 
                    ? 'text-[#ECDFCC] font-medium' 
                    : 'text-[#D4C5B3]'
                  }`} title={convo.title || 'Untitled'}>
                    {convo.title || 'Untitled'}
                  </span>
                  <button
                    className="ml-2 flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:ring-2 focus:ring-red-400/50 rounded-lg p-2 transition-all duration-200 bg-[#2A2E24]/60 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] group"
                    onClick={e => { e.stopPropagation(); deleteConversation(convo.conversation_id); }}
                    title="Delete"
                    tabIndex={0}
                    style={{ minWidth: 32 }}
                  >
                    <FaTrashAlt className="w-4 h-4 drop-shadow-[0_0_4px_rgba(239,68,68,0.3)] group-hover:rotate-12 transition-transform duration-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full flex-shrink-0 mt-auto">
            <div className="flex flex-col gap-2 w-full pt-4 border-t border-[#697565]/30">
              <div className="flex items-center gap-3 w-full bg-[#2A2E24] rounded-lg p-3 shadow-lg">
                <FaUser className="text-[#ECDFCC] w-5 h-5 drop-shadow-[0_0_4px_rgba(236,223,204,0.3)]" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[#ECDFCC] text-sm font-semibold truncate">{user?.name || 'User'}</span>
                  <span className="text-[#D4C5B3] text-xs truncate">{user?.email || ''}</span>
                </div>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600/80 text-[#ECDFCC] px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-400/50 transition-all duration-200 font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] mt-2 group"
                onClick={logout}
                title="Logout"
              >
                <FaSignOutAlt className="w-5 h-5 drop-shadow-[0_0_4px_rgba(236,223,204,0.3)] group-hover:-translate-x-1 transition-transform duration-200" />
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