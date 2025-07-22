import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../stores/useConversationStore';
import { FiTrash2, FiPlus, FiChevronLeft, FiMessageSquare } from 'react-icons/fi';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onConversationSelect: (conversationId: number) => void;
  selectedConversationId: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, onConversationSelect, selectedConversationId }) => {
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
    <div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300 opacity-100 block lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-screen bg-gray-900/95 transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'translate-x-0 opacity-100 w-full md:w-[60%] lg:w-[20%]' : '-translate-x-full opacity-0 w-0'}
          lg:fixed lg:top-0 lg:left-0 lg:z-50 lg:h-screen lg:bg-gray-900/95`}
        style={{ height: '100vh' }}
      >
        <div
          className={`h-full flex flex-col gap-4 shadow-2xl bg-gray-900/90 transition-all duration-500 ease-in-out overflow-hidden ${sidebarOpen ? 'p-4' : 'p-0'} sm:p-3`}
          style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        >
          <div className="flex items-center justify-between mb-2 pt-3">
            <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2 sm:text-base">
              <FiMessageSquare className="inline-block text-blue-400" />
              Conversations
            </h2>
            <button className="ml-2 text-gray-400 hover:text-blue-400 focus:ring-2 focus:ring-blue-500 rounded p-1 bg-gray-900/90" onClick={() => setSidebarOpen(false)} title="Collapse sidebar">
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
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 