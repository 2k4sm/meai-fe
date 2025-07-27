import React, { useEffect, useRef } from 'react';
import { useMessagesStore } from '../stores/useMessagesStore';
import { useConversationStore } from '../stores/useConversationStore';
import { useSocketConnection } from '../hooks/useSocketConnection';
import MessageItem from './MessageItem';
import InputForm from './InputForm';

interface ChatWindowProps {
  conversationId: number | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const {
    messages,
    loading,
    streaming,
    sendMessage,
    switchConversation,
    reset
  } = useMessagesStore();
  const { createConversation, selectConversation, updateConversationTitle } = useConversationStore();
  const { isConnected, connect, isConnecting } = useSocketConnection();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      reset();
      return;
    }
    
    switchConversation(conversationId).catch(error => {
      console.error('Failed to switch conversation:', error);
    });
  }, [conversationId, switchConversation, reset]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);


  const handleSend = async (input: string) => {
    if (!input.trim() || streaming) return;

    if (!isConnected) {
      console.log('Socket not connected, attempting to connect...');
      const connected = await connect();
      if (!connected) {
        console.error('Failed to connect socket, cannot send message');
        return;
      }
    }

    try {
      if (!conversationId) {
        const realConversation = await createConversation('New Conversation');
        if (!realConversation) {
          throw new Error('Failed to create conversation');
        }

        selectConversation(realConversation);
        const title = input.split(/\s+/).slice(0, 5).join(' ').slice(0, 50);
        await updateConversationTitle(realConversation.conversation_id, title);
        
        await switchConversation(realConversation.conversation_id);
        
        await sendMessage(realConversation.conversation_id, input.trim());
      } else {
        const currentConversation = useConversationStore.getState().selectedConversation;
        if (currentConversation && currentConversation.title === 'New Conversation') {
          const title = input.split(/\s+/).slice(0, 5).join(' ').slice(0, 50);
          await updateConversationTitle(conversationId, title);
        }
        await sendMessage(conversationId, input.trim());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex-1 bg-[#181C14] shadow-inner relative pt-20 w-full h-full lg:w-full lg:h-full">
      <div className="p-4 overflow-y-auto h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#D4C5B3]">
            <p className="text-xl font-medium text-[#ECDFCC] mb-2 backdrop-blur-sm bg-[#2A2E24]/50 px-4 py-2 rounded-lg shadow-sm">
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-5 pb-96">
            {messages.map((msg) => (
              <div key={msg.message_id + '-' + msg.created_at} className="w-[95%] md:w-[75%] lg:w-[50%] mx-auto">
                <MessageItem message={msg} status={msg.status} />
              </div>
            ))}

            {(loading || streaming) && (
              <div className="w-[95%] md:w-[85%] lg:w-[50%] mx-auto">
                <div className="w-full flex justify-start my-2">
                  <div className="inline-flex flex-col items-start text-left">
                    <div className="flex space-x-4 py-4">
                      <span className="block w-2 h-2 bg-[#697565] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="block w-2 h-2 bg-[#697565] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="block w-2 h-2 bg-[#697565] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <InputForm onSubmit={handleSend} disabled={streaming || isConnecting} />
    </div>
  );
};

export default ChatWindow; 