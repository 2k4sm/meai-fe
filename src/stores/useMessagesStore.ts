import { create } from 'zustand';
import { getMessages, deleteMessage as apiDeleteMessage } from '../api/messages';
import { conversationSocket } from '../api/socket';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  streaming: boolean;
  fetchMessages: (conversationId: number) => Promise<void>;
  deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => void;
  connectStream: (conversationId: number) => void;
  disconnectStream: () => void;
  reset: () => void;
}

let joinedConversationId: number | null = null;
let pendingSendQueue: { conversationId: number, content: string }[] = [];

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  streaming: false,

  fetchMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const backendMessages = await getMessages(conversationId);
      set(state => {
        const pendingLocals = state.messages.filter(
          m => m.conversation_id === conversationId && m.status === 'pending' &&
            !backendMessages.some(
              bm => bm.content === m.content && bm.type === m.type && bm.created_at === m.created_at
            )
        );
        return {
          messages: [...backendMessages, ...pendingLocals],
          loading: false
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch messages', loading: false });
    }
  },

  deleteMessage: async (conversationId, messageId) => {
    const prevMessages = get().messages;
    set(state => ({ messages: state.messages.filter(m => m.message_id !== messageId) }));
    try {
      await apiDeleteMessage(conversationId, messageId);
    } catch (err: any) {
      set({ messages: prevMessages, error: err.message || 'Failed to delete message' });
    }
  },

  sendMessage: (conversationId: number, content: string) => {
    const pendingMsg: Message = {
      message_id: -Date.now(),
      conversation_id: conversationId,
      user_id: 0,
      type: 'Human',
      content,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    set(state => ({ messages: [...state.messages, pendingMsg], streaming: true }));
    if (joinedConversationId === conversationId) {
      conversationSocket.sendMessage(content);
    } else {
      pendingSendQueue.push({ conversationId, content });
    }
  },

  connectStream: (conversationId) => {
    get().disconnectStream();
    conversationSocket.connect();
    conversationSocket.joinConversation(conversationId);
    set({ streaming: false });

    conversationSocket.off('assistant', handleAssistant);
    conversationSocket.off('tool', handleTool);
    conversationSocket.off('last_chunk', handleLastChunk);
    conversationSocket.off('error', handleError);
    conversationSocket.off('joined', handleJoined);
    conversationSocket.off('connect_error', handleConnectError);

    conversationSocket.on('assistant', handleAssistant);
    conversationSocket.on('tool', handleTool);
    conversationSocket.on('last_chunk', handleLastChunk);
    conversationSocket.on('error', handleError);
    conversationSocket.on('joined', handleJoined);
    conversationSocket.on('connect_error', handleConnectError);

    function handleAssistant(data: any) {
      set(state => {
        const messages = [...state.messages];
        const lastMsg = messages[messages.length - 1];
        if (
          messages.length > 0 &&
          lastMsg.type === 'AI' &&
          lastMsg.status === 'pending'
        ) {
          messages[messages.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + data.content,
          };
        } else {
          messages.push({
            message_id: Date.now(),
            conversation_id: conversationId,
            user_id: 0,
            type: 'AI',
            content: data.content,
            created_at: new Date().toISOString(),
            status: 'pending',
          });
        }
        return { messages };
      });
    }


    function handleTool(data: any) {
      set(state => {
        const messages = [...state.messages];
        if (
          messages.length > 0 &&
          messages[messages.length - 1].type === 'TOOL' &&
          state.streaming
        ) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: messages[messages.length - 1].content + data.content,
          };
        } else {
          messages.push({
            message_id: Date.now(),
            conversation_id: conversationId,
            user_id: 0,
            type: 'TOOL',
            content: data.content,
            created_at: new Date().toISOString(),
          });
        }
        return { messages };
      });
    }

    function handleLastChunk() {
      set(state => {
        const messages = [...state.messages];
        if (
          messages.length > 0 &&
          messages[messages.length - 1].type === 'AI' &&
          messages[messages.length - 1].status === 'pending'
        ) {
          delete messages[messages.length - 1].status;
        }
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type === 'Human' && messages[i].status === 'pending') {
            delete messages[i].status;
            break;
          }
        }
        return { messages, streaming: false };
      });
    }

    function handleError(err: any) {
      set(state => {
        const messages = [...state.messages];
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type === 'Human' && messages[i].status === 'pending') {
            messages[i].status = 'failed';
            break;
          }
        }
        return { error: err?.error || 'Socket error', streaming: false, messages };
      });
    }

    function handleJoined(data: any) {
      joinedConversationId = conversationId;
      pendingSendQueue = pendingSendQueue.filter(item => {
        if (item.conversationId === conversationId) {
          conversationSocket.sendMessage(item.content);
          return false;
        }
        return true;
      });
      console.log('Joined:', data);
    }

    function handleConnectError(err: any) {
      set(state => {
        const messages = [...state.messages];
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type === 'Human' && messages[i].status === 'pending') {
            messages[i].status = 'failed';
            break;
          }
        }
        return { error: err?.message || 'Socket connect error', streaming: false, messages };
      });
      console.error('Socket connect error:', err);
    }
  },

  disconnectStream: () => {
    conversationSocket.disconnect();
    set({ streaming: false });
  },

  reset: () => {
    get().disconnectStream();
    set({ messages: [], loading: false, error: null, streaming: false });
  },
})); 