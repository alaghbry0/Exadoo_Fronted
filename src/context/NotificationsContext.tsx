// context/NotificationsContext.tsx (النسخة النهائية المحسنة مع useMemo و useCallback)

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import axios from 'axios';
import { useTelegram } from './TelegramContext';
import { NotificationType } from '@/types/notification'; // تأكد من أن هذا المسار صحيح

interface NotificationsContextProps {
  unreadCount: number;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  isMarkingAsRead: boolean; // حالة التحميل لعملية قراءة إشعار واحد
  isMarkingAllAsRead: boolean; // حالة التحميل لعملية قراءة كل الإشعارات
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

// Hook لجلب عدد الإشعارات غير المقروءة
const useUnreadCount = (telegramId: string | null) => {
  return useQuery<number>({
    queryKey: ['unreadNotificationsCount', telegramId],
    queryFn: async () => {
      if (!telegramId) return 0;
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/unread-count`,
        { params: { telegram_id: telegramId } }
      );
      return data.unread_count;
    },
    enabled: !!telegramId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();

  const { data: unreadCount } = useUnreadCount(telegramId);

  // --- Mutation لتحديد إشعار واحد كمقروء (مع تحديث متفائل) ---
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notificationId}/mark-read`,
        null,
        { params: { telegram_id: telegramId } }
      ),

    onMutate: async (notificationId: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', telegramId] });
      await queryClient.cancelQueries({ queryKey: ['unreadNotificationsCount', telegramId] });

      const previousNotifications = queryClient.getQueryData(['notifications', telegramId]);
      const previousUnreadCount = queryClient.getQueryData(['unreadNotificationsCount', telegramId]);

      // 1. تحديث قائمة الإشعارات في الكاش
      queryClient.setQueryData<InfiniteData<NotificationType[]>>(
        ['notifications', telegramId, 'all'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page =>
              page.map(notif => notif.id === notificationId ? { ...notif, read_status: true } : notif)
            ),
          };
        }
      );
      // إزالة الإشعار من قائمة "غير المقروء" في الكاش
      queryClient.setQueryData<InfiniteData<NotificationType[]>>(
        ['notifications', telegramId, 'unread'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => page.filter(notif => notif.id !== notificationId)),
          };
        }
      );

      // 2. تحديث عدد غير المقروء في الكاش
      queryClient.setQueryData<number>(['unreadNotificationsCount', telegramId], (old) => (old ? Math.max(0, old - 1) : 0));

      return { previousNotifications, previousUnreadCount };
    },

    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', telegramId], context.previousNotifications);
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['unreadNotificationsCount', telegramId], context.previousUnreadCount);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
    },
  });

  // --- Mutation لتحديد كل الإشعارات كمقروءة (مع تحديث متفائل) ---
  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/mark-all-read`,
        null,
        { params: { telegram_id: telegramId } }
      ),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', telegramId] });
      await queryClient.cancelQueries({ queryKey: ['unreadNotificationsCount', telegramId] });

      const previousNotifications = queryClient.getQueryData(['notifications', telegramId]);
      const previousUnreadCount = queryClient.getQueryData(['unreadNotificationsCount', telegramId]);

      // 1. تحديث قائمة "all" في الكاش
      queryClient.setQueryData<InfiniteData<NotificationType[]>>(
        ['notifications', telegramId, 'all'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page =>
              page.map(notif => ({ ...notif, read_status: true }))
            ),
          };
        }
      );
      // 2. إفراغ قائمة "unread" في الكاش
       queryClient.setQueryData<InfiniteData<NotificationType[]>>(
        ['notifications', telegramId, 'unread'], (oldData) => {
          if (!oldData) return { pages: [[]], pageParams: [undefined] };
          return { ...oldData, pages: [[]] };
        }
      );

      // 3. تحديث العدد إلى صفر في الكاش
      queryClient.setQueryData(['unreadNotificationsCount', telegramId], 0);

      return { previousNotifications, previousUnreadCount };
    },

    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', telegramId], context.previousNotifications);
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(['unreadNotificationsCount', telegramId], context.previousUnreadCount);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
    },
  });

  // =============================================================
  // 🔽🔽🔽 بداية التعديلات المدمجة 🔽🔽🔽
  // =============================================================

  // استخدم useCallback لتثبيت الدوال ومنع إعادة إنشائها عند كل re-render
  const markAsRead = useCallback((notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // استخدم useMemo لتثبيت كائن value ومنع إعادة إنشائه طالما أن قيمه لم تتغير
  const contextValue = useMemo(() => ({
    unreadCount: unreadCount ?? 0,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }), [
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsReadMutation.isPending,
    markAllAsReadMutation.isPending
  ]);

  // =============================================================
  // 🔼🔼🔼 نهاية التعديلات المدمجة 🔼🔼🔼
  // =============================================================

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook مخصص للوصول إلى السياق بسهولة
export const useNotificationsContext = (): NotificationsContextProps => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};