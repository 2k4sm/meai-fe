import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useConversationStore } from '../stores/useConversationStore';
import { useMessagesStore } from '../stores/useMessagesStore';

const MainLayout: React.FC = () => {
  const { selectedConversation, selectConversation, createConversation, updateConversationTitle } = useConversationStore();
  const { sendMessage, fetchMessages, connectStream } = useMessagesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleConversationSelect = (conversationId: number) => {
    const convo = useConversationStore.getState().conversations.find(c => c.conversation_id === conversationId);
    if (convo) selectConversation(convo);
    setSidebarOpen(false);
  };

  const handleCreateAndSendMessage = async (input: string) => {
    await createConversation('Untitled');
    const convo = useConversationStore.getState().selectedConversation;
    if (convo) {
      await fetchMessages(convo.conversation_id);
      connectStream(convo.conversation_id);
      sendMessage(convo.conversation_id, input);
      // Update the conversation title to the first user message
      await updateConversationTitle(convo.conversation_id, input);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#181C14] relative">
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-30 lg:hidden bg-[#3C3D37]/80 text-[#ECDFCC] hover:text-[#D4C5B3] p-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[#697565]"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onConversationSelect={handleConversationSelect}
        selectedConversationId={selectedConversation?.conversation_id ?? null}
      />
      <div className="flex-1 flex flex-col transition-all duration-500 ease-in-out relative">
        <div className="w-full h-full flex flex-col">
          <ChatWindow conversationId={selectedConversation?.conversation_id ?? null} onCreateAndSendMessage={handleCreateAndSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 