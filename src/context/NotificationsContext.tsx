// context/NotificationsContext.tsx
import React, { createContext, useCallback, useContext, useState, ReactNode, useEffect } from 'react';
import { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTelegram } from './TelegramContext';

interface Notification {
  id: number;
  read_status: boolean;
  // يمكن إضافة المزيد من الخصائص هنا
}

interface NotificationPage {
  notifications: Notification[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

interface NotificationsContextProps {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  markAsRead: (notificationId: number | string) => void;
  invalidateNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!telegramId) return;

      try {
        const cachedCount = localStorage.getItem(`unreadCount_${telegramId}`);
        if (cachedCount) {
          const { count, timestamp } = JSON.parse(cachedCount);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setUnreadCount(count);
            return;
          }
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`,
          { params: { telegram_id: telegramId } }
        );

        setUnreadCount(data.unread_count || 0);
        localStorage.setItem(
          `unreadCount_${telegramId}`,
          JSON.stringify({ count: data.unread_count, timestamp: Date.now() })
        );
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [telegramId]);

  const markAsRead = useCallback((notificationId: number | string) => {
    if (!telegramId) return;

    // تخفيض عداد الإشعارات غير المقروءة
    setUnreadCount(prev => Math.max(0, prev - 1));

    // تحديث بيانات الإشعارات في الكاش الخاص بالـ "all"
    queryClient.setQueryData(
      ['notifications', telegramId, 'all'],
      (oldData: InfiniteData<NotificationPage> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            notifications: page.notifications.map(notification =>
              notification.id === notificationId
                ? { ...notification, read_status: true }
                : notification
            )
          }))
        };
      }
    );

    // تحديث بيانات الإشعارات في الكاش الخاص بالـ "unread"
    queryClient.setQueryData(
      ['notifications', telegramId, 'unread'],
      (oldData: InfiniteData<NotificationPage> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages
            .map(page => ({
              ...page,
              notifications: page.notifications.filter(notification => notification.id !== notificationId)
            }))
            .filter(page => page.notifications.length > 0)
        };
      }
    );

    // تحديث قيمة الكاش المحلي للعداد
    const cachedCountData = localStorage.getItem(`unreadCount_${telegramId}`);
    if (cachedCountData) {
      const { timestamp } = JSON.parse(cachedCountData);
      localStorage.setItem(
        `unreadCount_${telegramId}`,
        JSON.stringify({ count: Math.max(0, unreadCount - 1), timestamp })
      );
    }

    // إرسال الطلب لخادم الخلفية لتحديث حالة الإشعار
    axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}/mark-read`,
      null,
      { params: { telegram_id: telegramId } }
    ).catch(error => {
      console.error('Failed to mark notification as read:', error);
      // في حال فشل الطلب يرجع العداد لحالته السابقة
      setUnreadCount(prev => prev + 1);
    });
  }, [telegramId, unreadCount, queryClient]);

  const markAllAsRead = useCallback(async () => {
    if (!telegramId) return;

    const previousCount = unreadCount;
    setUnreadCount(0);

    queryClient.setQueryData(
      ['notifications', telegramId, 'all'],
      (oldData: InfiniteData<NotificationPage> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            notifications: page.notifications.map(notification => ({
              ...notification,
              read_status: true
            }))
          }))
        };
      }
    );

    queryClient.setQueryData(
      ['notifications', telegramId, 'unread'],
      (oldData: InfiniteData<NotificationPage> | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: []
        };
      }
    );

    const cachedCountData = localStorage.getItem(`unreadCount_${telegramId}`);
    if (cachedCountData) {
      const { timestamp } = JSON.parse(cachedCountData);
      localStorage.setItem(
        `unreadCount_${telegramId}`,
        JSON.stringify({ count: 0, timestamp })
      );
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`,
        null,
        { params: { telegram_id: telegramId } }
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setUnreadCount(previousCount);
    }
  }, [telegramId, unreadCount, queryClient]);

  const invalidateNotifications = useCallback(() => {
    if (!telegramId) return;
    queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
    queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
    localStorage.removeItem(`notifications_${telegramId}_all`);
    localStorage.removeItem(`notifications_${telegramId}_unread`);
    localStorage.removeItem(`unreadCount_${telegramId}`);
  }, [telegramId, queryClient]);

  return (
    <NotificationsContext.Provider value={{
      unreadCount,
      setUnreadCount: (count) => setUnreadCount(Math.max(0, count)),
      markAsRead,
      invalidateNotifications,
      markAllAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = (): NotificationsContextProps => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsContext must be used within a NotificationsProvider");
  }
  return context;
};
