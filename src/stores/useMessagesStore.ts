import { create } from 'zustand';
import { getMessages, deleteMessage as apiDeleteMessage } from '../api/messages';
import { conversationSocket } from '../api/socket';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  streaming: boolean;
  currentConversationId: number | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'failed';
  fetchMessages: (conversationId: number) => Promise<void>;
  deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => void;
  switchConversation: (conversationId: number) => void;
  reset: () => void;
  retryConnection: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  streaming: false,
  currentConversationId: null,
  connectionStatus: 'disconnected',

  fetchMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const backendMessages = await getMessages(conversationId);
      set(state => {
        const pendingMessages = state.messages.filter(
          m => m.conversation_id === conversationId && m.status === 'pending'
        );
        return {
          messages: [...backendMessages, ...pendingMessages],
          loading: false
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch messages', loading: false });
    }
  },

  deleteMessage: async (conversationId, messageId) => {
    const prevMessages = get().messages;
    useMessagesStore.setState(state => ({ messages: state.messages.filter(m => m.message_id !== messageId) }));
    try {
      await apiDeleteMessage(conversationId, messageId);
    } catch (err: any) {
      useMessagesStore.setState({ messages: prevMessages, error: err.message || 'Failed to delete message' });
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

    useMessagesStore.setState(state => ({ 
      messages: [...state.messages, pendingMsg], 
      streaming: true 
    }));

    const currentSocketConversation = conversationSocket.getCurrentConversationId();
    if (currentSocketConversation !== conversationId) {
      conversationSocket.joinConversation(conversationId);
    }

    const success = conversationSocket.sendMessage(content);
    if (!success) {
      useMessagesStore.setState(state => ({
        messages: state.messages.map(msg => 
          msg.message_id === pendingMsg.message_id 
            ? { ...msg, status: 'failed' as const }
            : msg
        ),
        streaming: false
      }));
    }
  },

  switchConversation: (conversationId: number) => {
    const currentId = get().currentConversationId;
    
    if (currentId === conversationId) return;

    useMessagesStore.setState({ 
      messages: [], 
      currentConversationId: conversationId,
      streaming: false,
      error: null 
    });

    conversationSocket.joinConversation(conversationId);
    
    get().fetchMessages(conversationId);
  },

  reset: () => {
    useMessagesStore.setState({ 
      messages: [], 
      loading: false, 
      error: null, 
      streaming: false,
      currentConversationId: null,
      connectionStatus: 'disconnected'
    });
  },

  retryConnection: () => {
    conversationSocket.forceReconnect();
  },
}));

conversationSocket.on('joined', () => {
  useMessagesStore.setState({ connectionStatus: 'connected' });
});

conversationSocket.on('disconnect', () => {
  useMessagesStore.setState({ 
    connectionStatus: 'disconnected',
    streaming: false 
  });
});

conversationSocket.on('assistant', (data) => {
  useMessagesStore.setState(state => {
    const messages = [...state.messages];
    const lastMsg = messages[messages.length - 1];
    
    if (lastMsg?.type === 'AI' && lastMsg.status === 'pending') {
      messages[messages.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + data.content,
      };
    } else {
      messages.push({
        message_id: Date.now(),
        conversation_id: state.currentConversationId!,
        user_id: 0,
        type: 'AI',
        content: data.content,
        created_at: new Date().toISOString(),
        status: 'pending',
      });
    }
    return { messages, connectionStatus: 'connected' };
  });
});

conversationSocket.on('tool', (data) => {
  useMessagesStore.setState(state => {
    const messages = [...state.messages];
    const lastMsg = messages[messages.length - 1];
    
    if (lastMsg?.type === 'TOOL' && state.streaming) {
      messages[messages.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + data.content,
      };
    } else {
      messages.push({
        message_id: Date.now(),
        conversation_id: state.currentConversationId!,
        user_id: 0,
        type: 'TOOL',
        content: data.content,
        created_at: new Date().toISOString(),
      });
    }
    return { messages, connectionStatus: 'connected' };
  });
});

conversationSocket.on('last_chunk', () => {
  useMessagesStore.setState(state => {
    const messages = [...state.messages];
    
    messages.forEach(msg => {
      if (msg.status === 'pending') {
        delete msg.status;
      }
    });
    
    return { messages, streaming: false, connectionStatus: 'connected' };
  });
});

conversationSocket.on('error', (data) => {
  useMessagesStore.setState(state => {
    const messages = [...state.messages];    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'Human' && messages[i].status === 'pending') {
        messages[i].status = 'failed';
        break;
      }
    }
    
    return { 
      messages,
      error: data?.error || 'Socket error', 
      streaming: false,
      connectionStatus: 'failed'
    };
  });
});
