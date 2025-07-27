import { io, Socket } from 'socket.io-client';

const NAMESPACE = '/conversations/stream';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ConversationSocket {
  private socket: Socket | null = null;
  private currentConversationId: number | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  connect() {
    if (this.socket?.connected) return;
    
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.isConnecting = true;
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.socket = io(SOCKET_URL + NAMESPACE, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: false,
        timeout: 90000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupSocketListeners();
      
      const onConnect = () => {
        this.isConnecting = false;
        this.connectionPromise = null;
        resolve();
      };
      
      const onConnectError = (error: any) => {
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      };
      
      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onConnectError);
      
      this.socket.connect();
    });
    
    return this.connectionPromise;
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

  async sendMessage(content: string) {
    if (this.currentConversationId === null) {
      console.error('Cannot send message - no conversation selected');
      return false;
    }

    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect...');
      try {
        await this.connect();
      } catch (error) {
        console.error('Failed to connect socket:', error);
        return false;
      }
    }

    if (!this.isJoined) {
      try {
        await this.joinConversation(this.currentConversationId);
      } catch (error) {
        console.error('Failed to join conversation:', error);
        return false;
      }
    }

    if (!this.socket) {
      console.error('Socket is null after connection attempt');
      return false;
    }
    
    this.socket.emit('message', { 
      content,
      conversation_id: this.currentConversationId 
    });
    return true;
  }

  private isJoined = false;

  joinConversation(conversationId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentConversationId === conversationId && this.socket?.connected && this.isJoined) {
        resolve();
        return;
      }

      this.emit('connecting', {});

      this.currentConversationId = conversationId;
      this.isJoined = false;
      
      if (!this.socket?.connected) {
        this.connect()?.then(() => {
          if (this.socket) {
            this.socket.emit('join_conversation', { conversation_id: conversationId });
          } else {
            reject(new Error('Socket is null after connection'));
          }
        }).catch((error) => {
          console.error('Failed to connect for join conversation:', error);
          reject(error);
        });
      } else {
        const socket = this.socket;
        if (socket) {
          socket.emit('join_conversation', { conversation_id: conversationId });
        } else {
          reject(new Error('Socket is null'));
          return;
        }
      }

      const timeout = setTimeout(() => {
        reject(new Error('Join conversation timeout'));
      }, 5000);

      const onJoined = () => {
        clearTimeout(timeout);
        this.isJoined = true;
        this.emit('connect', {});
        resolve();
      };

      this.once('joined', onJoined);
    });
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  once(event: string, handler: (data: any) => void) {
    const onceHandler = (data: any) => {
      this.off(event, onceHandler);
      handler(data);
    };
    this.on(event, onceHandler);
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
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  getCurrentConversationId(): number | null {
    return this.currentConversationId;
  }

  clearConversation() {
    this.currentConversationId = null;
    this.isJoined = false;
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