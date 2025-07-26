import { io, Socket } from 'socket.io-client';

const NAMESPACE = '/conversations/stream';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ConversationSocket {
  private socket: Socket | null = null;
  private currentConversationId: number | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket?.connected) return;
    
    
    this.socket = io(SOCKET_URL + NAMESPACE, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      timeout: 90000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {    
      if (this.currentConversationId !== null) {
        this.joinConversation(this.currentConversationId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.emit('disconnect', { reason });
    });

    this.socket.on('joined', (data) => {
      this.emit('joined', data);
    });

    this.socket.on('assistant', (data) => {
      this.emit('assistant', data);
    });

    this.socket.on('tool', (data) => {
      this.emit('tool', data);
    });

    this.socket.on('last_chunk', (data) => {
      this.emit('last_chunk', data);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  joinConversation(conversationId: number) {
    if (this.currentConversationId === conversationId && this.socket?.connected) {
      return;
    }

    this.currentConversationId = conversationId;
    
    if (!this.socket?.connected) {
      this.connect();
      return;
    }

    this.socket.emit('join_conversation', { conversation_id: conversationId });
  }

  sendMessage(content: string) {
    if (!this.socket?.connected) {
      console.error('Cannot send message - socket not connected');
      return false;
    }

    if (this.currentConversationId === null) {
      console.error('Cannot send message - no conversation selected');
      return false;
    }

    this.socket.emit('message', { content });
    return true;
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentConversationId = null;
    this.eventHandlers.clear();
  }

  getCurrentConversationId(): number | null {
    return this.currentConversationId;
  }

  isSocketConnected(): boolean {
    return this.socket?.connected === true;
  }

  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

export const conversationSocket = new ConversationSocket(); 