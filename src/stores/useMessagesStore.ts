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
    try {
      await apiDeleteMessage(conversationId, messageId);
      set(state => ({ messages: state.messages.filter(m => m.message_id !== messageId) }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete message' });
    }
  },

  sendMessage: (content) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ content }));
      set({ streaming: true });
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
          set({ streaming: false });
        } else if (data.role && data.content !== undefined) {
          set(state => ({
            messages: [
              ...state.messages,
              {
                message_id: Date.now(),
                conversation_id: conversationId,
                user_id: 0,
                type: data.role === 'assistant' ? 'AI' : 'TOOL',
                content: data.content,
                created_at: new Date().toISOString(),
              },
            ],
          }));
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