import { create } from 'zustand';
import { Subscription } from '../types';
import { getUserSubscriptions } from '../services/api';

interface ProfileState {
  subscriptions: Subscription[] | null;
  error: string | null;
  isLoading: boolean;
  loadSubscriptions: (telegramId: string) => Promise<void>;
  setSubscriptions: (subs: Subscription[]) => void;
  setError: (error: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  subscriptions: null,
  error: null,
  isLoading: false,
  setSubscriptions: (subs: Subscription[]) => set({ subscriptions: subs }),
  setError: (error: string | null) => set({ error }),
  loadSubscriptions: async (telegramId) => {
    set({ isLoading: true, error: null });
    try {
      const cached = localStorage.getItem('subscriptions');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 300000) {
          set({ subscriptions: data, isLoading: false });
          return;
        }
      }

      const res = await getUserSubscriptions(telegramId);
      localStorage.setItem('subscriptions', JSON.stringify({
        data: res.subscriptions,
        timestamp: Date.now()
      }));
      set({ subscriptions: res.subscriptions, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير معروف';
      set({
        error: `فشل في جلب البيانات: ${message}`,
        isLoading: false
      });
    }
  }
}));
