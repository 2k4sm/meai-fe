import { create } from 'zustand';
import {
  listConversations,
  createConversation as apiCreateConversation,
  deleteConversation as apiDeleteConversation,
  updateConversationTitle as apiUpdateConversationTitle,
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
  updateConversationTitle: (id: number, title: string) => Promise<void>;
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
    const tempId = -Date.now();
    const tempConvo = {
      conversation_id: tempId,
      user_id: 0,
      title,
      summary_text: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({
      conversations: [tempConvo, ...state.conversations],
      selectedConversation: tempConvo,
      loading: true,
    }));
    try {
      const convo = await apiCreateConversation(title);
      set((state) => ({
        conversations: [convo, ...state.conversations.filter(c => c.conversation_id !== tempId)],
        selectedConversation: convo,
        loading: false,
      }));
    } catch (err: any) {
      set((state) => ({
        conversations: state.conversations.filter(c => c.conversation_id !== tempId),
        error: err?.detail || 'Failed to create conversation',
        loading: false,
        selectedConversation: state.selectedConversation?.conversation_id === tempId ? null : state.selectedConversation,
      }));
    }
  },
  deleteConversation: async (id: number) => {
    const prevConvos = get().conversations;
    const prevSelected = get().selectedConversation;
    set((state) => {
      const conversations = state.conversations.filter((c) => c.conversation_id !== id);
      const selectedConversation =
        state.selectedConversation?.conversation_id === id ? null : state.selectedConversation;
      return { conversations, selectedConversation, loading: true, error: null };
    });
    try {
      await apiDeleteConversation(id);
      set({ loading: false });
    } catch (err: any) {
      set({ conversations: prevConvos, selectedConversation: prevSelected, error: err?.detail || 'Failed to delete conversation', loading: false });
    }
  },
  selectConversation: (convo: Conversation) => set({ selectedConversation: convo }),
  updateConversationTitle: async (id: number, title: string) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiUpdateConversationTitle(id, title);
      set((state) => ({
        conversations: state.conversations.map(c =>
          c.conversation_id === id ? { ...c, title: updated.title } : c
        ),
        selectedConversation: state.selectedConversation && state.selectedConversation.conversation_id === id
          ? { ...state.selectedConversation, title: updated.title }
          : state.selectedConversation,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err?.detail || 'Failed to update title', loading: false });
    }
  },
})); 