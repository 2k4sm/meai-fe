import { create } from 'zustand';
import { getMe, logout as apiLogout } from '../api/auth';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getMe();
      set({ user, loading: false });
    } catch (err: any) {
      set({ user: null, loading: false, error: err?.detail || 'Failed to fetch user' });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiLogout();
      set({ user: null, loading: false });
    } catch (err: any) {
      set({ error: err?.detail || 'Logout failed', loading: false });
    }
  },
  reset: () => set({ user: null, loading: false, error: null }),
})); 