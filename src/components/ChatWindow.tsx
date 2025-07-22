import React, { useEffect, useRef } from 'react';
import { useMessagesStore } from '../stores/useMessagesStore';
import MessageItem from './MessageItem';
import InputForm from './InputForm';
import { ToolkitList } from './ToolkitList';

interface ChatWindowProps {
  conversationId: number | null;
  onSidebarToggle?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps & { onCreateAndSendMessage?: (input: string) => void }> = ({ conversationId, onCreateAndSendMessage }) => {
  const {
    messages,
    loading,
    streaming,
    fetchMessages,
    sendMessage,
    connectStream,
    disconnectStream,
    reset,
  } = useMessagesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      reset();
      disconnectStream();
      return;
    }
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
    if (conversationId) {
      sendMessage(input.trim());
    } else if (onCreateAndSendMessage) {
      onCreateAndSendMessage(input.trim());
    }
  };

  return (
    <div className="flex-1 pb-44 bg-gradient-to-r from-gray-900 to-gray-800 shadow-inner relative pt-20">
      <div className="p-4 overflow-y-auto h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <p className="text-xl font-medium text-slate-200 mb-2 backdrop-blur-sm bg-black/50 px-4 py-2 rounded-lg shadow-sm">
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-5">
            {messages.map((msg) => (
              <div key={msg.message_id + '-' + msg.created_at} className="w-[95%] md:w-[85%] lg:w-[50%] mx-auto">
                <MessageItem message={msg} status={msg.status} />
              </div>
            ))}

            {(loading || streaming) && (
              <div className="w-[95%] md:w-[85%] lg:w-[50%] mx-auto">
                <div className="w-full flex justify-start my-2">
                  <div className="inline-flex flex-col items-start text-left">
                    <div className="flex space-x-4 py-4">
                      <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="fixed left-1/2 transform -translate-x-1/2 z-40 w-[90%] lg:w-[50%] bottom-[108px] pointer-events-none">
        <div className="pointer-events-auto">
          <ToolkitList />
        </div>
      </div>
      <InputForm onSubmit={handleSend} disabled={streaming} />
    </div>
  );
};

export default ChatWindow; 