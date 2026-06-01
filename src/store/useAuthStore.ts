import { create } from 'zustand';
import api from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  avatar?: string;
  google_id?: string;
  total_spent?: number;
  rank?: any;
  bank_name?: string;
  bank_account_no?: string;
  bank_account_name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: true,

  login: (token, user) => {
    localStorage.setItem('auth_token', token);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => {
    set({ user });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        set({ user: response.data.data, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
