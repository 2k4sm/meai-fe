import { create } from 'zustand';
import {
  listConversations,
  createConversation as apiCreateConversation,
  deleteConversation as apiDeleteConversation,
} from '../api/conversations';

export interface Conversation {
  conversation_id: number;
  user_id: number;
  title: string | null;
  summary_text: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ConversationState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: (title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  selectConversation: (convo: Conversation) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  loading: false,
  error: null,
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await listConversations();
      set({ conversations: data.conversations, loading: false });
    } catch (err: any) {
      set({ error: err?.detail || 'Failed to fetch conversations', loading: false });
    }
  },
  createConversation: async (title: string) => {
    set({ loading: true, error: null });
    try {
      const convo = await apiCreateConversation(title);
      set((state) => ({
        conversations: [convo, ...state.conversations],
        loading: false,
        selectedConversation: convo,
      }));
    } catch (err: any) {
      set({ error: err?.detail || 'Failed to create conversation', loading: false });
    }
  },
  deleteConversation: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiDeleteConversation(id);
      set((state) => {
        const conversations = state.conversations.filter((c) => c.conversation_id !== id);
        const selectedConversation =
          state.selectedConversation?.conversation_id === id ? null : state.selectedConversation;
        return { conversations, loading: false, selectedConversation };
      });
    } catch (err: any) {
      set({ error: err?.detail || 'Failed to delete conversation', loading: false });
    }
  },
  selectConversation: (convo: Conversation) => set({ selectedConversation: convo }),
})); 