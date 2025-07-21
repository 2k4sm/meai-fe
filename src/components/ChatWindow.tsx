import React, { useEffect, useRef } from 'react';
import { useMessagesStore } from '../stores/useMessagesStore';
import MessageItem from './MessageItem';
import InputForm from './InputForm';

interface ChatWindowProps {
  conversationId: number;
  onSidebarToggle?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onSidebarToggle }) => {
  const {
    messages,
    loading,
    error,
    streaming,
    fetchMessages,
    sendMessage,
    connectStream,
    disconnectStream,
    reset,
  } = useMessagesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages(conversationId);
    connectStream(conversationId);
    return () => {
      disconnectStream();
      reset();
    };
    // eslint-disable-next-line
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);

  const handleSend = (input: string) => {
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
  };

  return (
    <div className="flex-1 pb-44 bg-gradient-to-r from-gray-900 to-gray-800 shadow-inner">
      <div className="p-4 overflow-y-auto h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <p className="text-xl font-medium text-slate-200 mb-2 backdrop-blur-sm bg-black/50 px-4 py-2 rounded-lg shadow-sm">
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-5">
            {messages.map((msg, index) => (
              <div key={msg.message_id + '-' + msg.created_at} className="w-[95%] md:w-[85%] lg:w-[50%] mx-auto">
                <MessageItem message={msg} />
              </div>
            ))}

            {(loading || streaming) && (
              <div className="ml-[9%] lg:ml-[15%] bg-black/70 p-4 rounded-2xl rounded-bl-none max-w-[70%] animate-pulse shadow-sm backdrop-blur-lg border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex-shrink-0 shadow-md"></div>
                  <div className="h-3 bg-slate-600 rounded-full w-28"></div>
                </div>
                <div className="h-3 bg-slate-600 rounded-full w-full mt-3"></div>
                <div className="h-3 bg-slate-600 rounded-full w-40 mt-2"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <InputForm onSubmit={handleSend} disabled={streaming} />
    </div>
  );
};

export default ChatWindow; 