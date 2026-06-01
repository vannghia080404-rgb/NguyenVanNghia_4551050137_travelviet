import { create } from 'zustand';
import api from '@/lib/api';

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  isLoading: true,
  fetchSettings: async () => {
    try {
      const response = await api.get('/settings/global');
      if (response.data.success) {
        set({ settings: response.data.data, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
      set({ isLoading: false });
    }
  },
}));
