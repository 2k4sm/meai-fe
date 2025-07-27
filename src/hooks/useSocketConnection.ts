import { useState, useEffect } from 'react';
import { conversationSocket } from '../api/socket';
import { useAuthStore } from '../stores/useAuthStore';

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(conversationSocket.isSocketConnected());
    };

    updateConnectionStatus();

    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleConnecting = () => {
      setIsConnecting(true);
    };

    conversationSocket.on('connect', handleConnect);
    conversationSocket.on('disconnect', handleDisconnect);
    conversationSocket.on('connecting', handleConnecting);

    return () => {
      conversationSocket.off('connect', handleConnect);
      conversationSocket.off('disconnect', handleDisconnect);
      conversationSocket.off('connecting', handleConnecting);
    };
  }, []);

  const connect = async () => {
    if (!isAuthenticated()) {
      console.warn('Cannot connect socket: user not authenticated');
      return false;
    }

    if (isConnected) {
      return true;
    }

    setIsConnecting(true);
    try {
      await conversationSocket.connect();
      return true;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setIsConnecting(false);
      return false;
    }
  };

  const disconnect = () => {
    conversationSocket.disconnect();
  };

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    isAuthenticated: isAuthenticated(),
  };
}; 