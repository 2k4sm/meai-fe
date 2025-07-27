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
  fetchMessages: (conversationId: number) => Promise<void>;
  deleteMessage: (conversationId: number, messageId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  switchConversation: (conversationId: number) => Promise<void>;
  reset: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  streaming: false,
  currentConversationId: null,

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

  sendMessage: async (conversationId: number, content: string) => {
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

    try {
      const success = await conversationSocket.sendMessage(content);
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
    } catch (error) {
      console.error('Failed to send message:', error);
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

  switchConversation: async (conversationId: number) => {
    const currentId = get().currentConversationId;
    
    if (currentId === conversationId) return;

    conversationSocket.clearConversation();

    const optimisticMessages = get().messages.filter(msg => 
      msg.conversation_id === conversationId && msg.status === 'pending'
    );

    useMessagesStore.setState({ 
      messages: optimisticMessages, 
      currentConversationId: conversationId,
      streaming: false,
      error: null
    });

    if (conversationId > 0) {
      try {
        await conversationSocket.joinConversation(conversationId);
        
        await get().fetchMessages(conversationId);
      } catch (error) {
        console.error('Failed to switch conversation:', error);
        useMessagesStore.setState({ 
          error: 'Failed to connect to conversation'
        });
        throw error;
      }
    }
  },

  reset: () => {
    conversationSocket.clearConversation();
    useMessagesStore.setState({ 
      messages: [], 
      loading: false, 
      error: null, 
      streaming: false,
      currentConversationId: null
    });
  },
}));

conversationSocket.on('disconnect', () => {
  useMessagesStore.setState({ 
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
    return { messages };
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
    return { messages };
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
    
    return { messages, streaming: false };
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
      streaming: false
    };
  });
});
