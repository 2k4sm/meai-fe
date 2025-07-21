import { io, Socket } from 'socket.io-client';

const NAMESPACE = '/conversations/stream';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ConversationSocket {
  private socket: Socket | null = null;
  private currentConversationId: number | null = null;


  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL + NAMESPACE, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: false,
        forceNew: true,
      });
      this.socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err);
      });
    }
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversationId = null;
    }
  }

  joinConversation(conversationId: number) {
    if (!this.socket) this.connect();
    if (this.currentConversationId === conversationId) return;
    this.currentConversationId = conversationId;
    this.socket?.emit('join_conversation', { conversation_id: conversationId });
  }

  sendMessage(content: string) {
    this.socket?.emit('message', { content });
  }

  on(event: string, handler: (data: any) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler: (data: any) => void) {
    this.socket?.off(event, handler);
  }
}

export const conversationSocket = new ConversationSocket(); 