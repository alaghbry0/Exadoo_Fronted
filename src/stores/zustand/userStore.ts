// src/stores/zustand/userStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Subscription } from "../../types";
import { getUserSubscriptions } from "../../services/api";
import logger from "../../core/utils/logger";

interface UserData {
  telegramId?: string | null;
  telegramUsername?: string | null;
  fullName?: string | null;
  photoUrl?: string | null;
  joinDate?: string | null;
  isLinked?: boolean;
  gmail?: string | null;
}

interface UserState {
  // بيانات المستخدم الأساسية
  telegramId: string | null;
  telegramUsername: string | null;
  fullName: string | null;
  photoUrl: string | null;
  joinDate: string | null;
  isLinked: boolean;
  gmail: string | null;

  // بيانات الاشتراكات (مدمجة من profileStore)
  subscriptions: Subscription[] | null;
  subscriptionsError: string | null;
  isLoadingSubscriptions: boolean;

  // Actions
  setUserData: (userData: Partial<UserData>) => void;
  clearUserData: () => void;
  setLinked: (isLinked: boolean, gmail?: string | null) => void;

  // Subscription actions
  setSubscriptions: (subs: Subscription[]) => void;
  loadSubscriptions: (telegramId: string) => Promise<void>;
  setSubscriptionsError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      telegramId: null,
      telegramUsername: null,
      fullName: null,
      photoUrl: null,
      joinDate: null,
      isLinked: false,
      gmail: null,
      subscriptions: null,
      subscriptionsError: null,
      isLoadingSubscriptions: false,

      // User data actions
      setUserData: (userData) => set((state) => ({ ...state, ...userData })),

      clearUserData: () =>
        set({
          telegramId: null,
          telegramUsername: null,
          fullName: null,
          photoUrl: null,
          joinDate: null,
          isLinked: false,
          gmail: null,
          subscriptions: null,
          subscriptionsError: null,
        }),

      setLinked: (isLinked, gmail = null) => set({ isLinked, gmail }),

      // Subscription actions
      setSubscriptions: (subs: Subscription[]) => set({ subscriptions: subs }),

      setSubscriptionsError: (error: string | null) =>
        set({ subscriptionsError: error }),

      loadSubscriptions: async (telegramId) => {
        set({ isLoadingSubscriptions: true, subscriptionsError: null });

        try {
          // محاولة استخدام الكاش أولاً
          const cached = localStorage.getItem("subscriptions");
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            // الكاش صالح لمدة 5 دقائق
            if (Date.now() - timestamp < 300000) {
              logger.info("Loading subscriptions from cache");
              set({ subscriptions: data, isLoadingSubscriptions: false });
              return;
            }
          }

          // جلب البيانات من الخادم
          logger.info("Fetching subscriptions from server");
          const res = await getUserSubscriptions(telegramId);

          // حفظ في الكاش
          localStorage.setItem(
            "subscriptions",
            JSON.stringify({
              data: res.subscriptions,
              timestamp: Date.now(),
            }),
          );

          set({
            subscriptions: res.subscriptions,
            isLoadingSubscriptions: false,
          });
          logger.success("Subscriptions loaded successfully");
        } catch (err) {
          const message = err instanceof Error ? err.message : "خطأ غير معروف";
          const errorMsg = `فشل في جلب البيانات: ${message}`;

          logger.error("Failed to load subscriptions:", err);
          set({
            subscriptionsError: errorMsg,
            isLoadingSubscriptions: false,
          });
        }
      },
    }),
    {
      name: "user-storage",
      // حفظ البيانات الحرجة فقط
      partialize: (state) => ({
        telegramId: state.telegramId,
        isLinked: state.isLinked,
        gmail: state.gmail,
      }),
    },
  ),
);

// Export للتوافق مع الكود القديم
export const useProfileStore = useUserStore;
