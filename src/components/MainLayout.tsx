import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useConversationStore } from '../stores/useConversationStore';

const MainLayout: React.FC = () => {
  const { selectedConversation, selectConversation } = useConversationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleConversationSelect = (conversationId: number) => {
    const convo = useConversationStore.getState().conversations.find(c => c.conversation_id === conversationId);
    if (convo) selectConversation(convo);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-gray-900 via-gray-950 to-black relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onConversationSelect={handleConversationSelect}
        selectedConversationId={selectedConversation?.conversation_id ?? null}
      />
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black transition-all duration-500 ease-in-out relative">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {selectedConversation ? (
          <div className="w-full h-full flex flex-col">
            <ChatWindow conversationId={selectedConversation.conversation_id} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">Select or create a conversation to start chatting.</div>
        )}
      </div>
    </div>
  );
};

export default MainLayout; 