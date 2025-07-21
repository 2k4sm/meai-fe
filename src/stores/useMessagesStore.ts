import { create } from 'zustand';
import { getMessages, deleteMessage as apiDeleteMessage, createMessageStream } from '../api/messages';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  streaming: boolean;
  ws: WebSocket | null;
  fetchMessages: (conversationId: number) => Promise<void>;
  deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
  sendMessage: (content: string) => void;
  connectStream: (conversationId: number) => void;
  disconnectStream: () => void;
  reset: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  streaming: false,
  ws: null,

  fetchMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const messages = await getMessages(conversationId);
      set({ messages, loading: false });
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

  sendMessage: (content) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const conversationId = get().messages[0]?.conversation_id || 0;
      const pendingMsg = {
        message_id: -Date.now(),
        conversation_id: conversationId,
        user_id: 0,
        type: 'Human' as 'Human',
        content,
        created_at: new Date().toISOString(),
        status: 'pending' as 'pending',
      };
      set(state => ({ messages: [...state.messages, pendingMsg], streaming: true }));
      ws.send(JSON.stringify({ content }));
    }
  },

  connectStream: (conversationId) => {
    get().disconnectStream();
    const ws = createMessageStream(conversationId);
    set({ ws, streaming: false });
    ws.onopen = () => {
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.last_chunk) {
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
        } else if (data.role && data.content !== undefined) {
          set(state => {
            const messages = [...state.messages];
            if (
              messages.length > 0 &&
              messages[messages.length - 1].type === 'AI' &&
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
                type: (data.role === 'assistant' ? 'AI' : 'TOOL') as 'AI' | 'TOOL',
                content: data.content,
                created_at: new Date().toISOString(),
                ...(data.role === 'assistant' ? { status: 'pending' as 'pending' } : {}),
              });
            }
            return { messages };
          });
        }
      } catch (e) {
        // Ignore parse errors  
      }
    };
    ws.onerror = () => {
      set({ error: 'WebSocket error', streaming: false });
    };
    ws.onclose = () => {
      set({ ws: null, streaming: false });
    };
  },

  disconnectStream: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
      set({ ws: null, streaming: false });
    }
  },

  reset: () => {
    get().disconnectStream();
    set({ messages: [], loading: false, error: null, streaming: false });
  },
})); 