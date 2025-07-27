import { create } from 'zustand';
import { getMe, logout as apiLogout } from '../api/auth';
import { conversationSocket } from '../api/socket';

export interface User {
  email: string;
  name: string;
  avatar_url: string | null;
  auth_method: string;
  user_id: number;
  last_login: string | null;
  created_at: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getMe();
      set({ user, loading: false });
      
      if (user) {
        console.log('User authenticated, connecting socket...');
        try {
          await conversationSocket.connect();
          console.log('Socket connected successfully');
        } catch (error) {
          console.error('Failed to connect socket after login:', error);
        }
      }
    } catch (err: any) {
      set({ user: null, loading: false, error: err?.detail || 'Failed to fetch user' });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiLogout();
      set({ user: null, loading: false });
      
      console.log('User logged out, disconnecting socket...');
      conversationSocket.disconnect();
    } catch (err: any) {
      set({ error: err?.detail || 'Logout failed', loading: false });
    }
  },
  reset: () => {
    set({ user: null, loading: false, error: null });
    conversationSocket.disconnect();
  },
  isAuthenticated: (): boolean => {
    const state = get();
    return state.user !== null;
  },
})); 