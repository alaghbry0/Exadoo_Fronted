// context/NotificationsContext.tsx
import React, { createContext, useCallback, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTelegram } from './TelegramContext';

interface NotificationsContextProps {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  markAsRead: (notificationId: number) => void;
  invalidateNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();

  // Fetch initial unread count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!telegramId) return;

      try {
        // Try to get from cache first
        const cachedCount = localStorage.getItem(`unreadCount_${telegramId}`);
        if (cachedCount) {
          const { count, timestamp } = JSON.parse(cachedCount);
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes cache
            setUnreadCount(count);
            return;
          }
        }

        // If not in cache or expired, fetch from API
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`,
          { params: { telegram_id: telegramId } }
        );

        setUnreadCount(data.unread_count || 0);

        // Cache the result
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

  // Optimistically mark a notification as read
  const markAsRead = useCallback((notificationId: number | string) => {
  if (!telegramId) return;


  // تحويل المعرف إلى سلسلة نصية للتأكد من توافقه
  const idString = notificationId.toString();
    // Optimistic update - reduce count immediately
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Update cache for better UX
    queryClient.setQueryData(
      ['notifications', telegramId, 'all'],
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((item: any) =>
              item.id === notificationId ? { ...item, read_status: true } : item
            )
          )
        };
      }
    );

    // Update unread notifications view as well
    queryClient.setQueryData(
      ['notifications', telegramId, 'unread'],
      (oldData: any) => {
        if (!oldData) return oldData;

        // Remove the notification from unread view or mark it as read
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.filter((item: any) => item.id !== notificationId)
          ).filter(page => page.length > 0)
        };
      }
    );

    // Update the unread count cache
    const cachedCountData = localStorage.getItem(`unreadCount_${telegramId}`);
    if (cachedCountData) {
      const { timestamp } = JSON.parse(cachedCountData);
      localStorage.setItem(
        `unreadCount_${telegramId}`,
        JSON.stringify({ count: Math.max(0, unreadCount - 1), timestamp })
      );
    }

    // Send API request to update server
    axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${idString}/mark-read`,
    null,
    { params: { telegram_id: telegramId } }

    ).catch(error => {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on failure
      setUnreadCount(prev => prev + 1);
    });
  }, [telegramId, unreadCount, queryClient]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!telegramId) return;

    // Optimistic update
    const previousCount = unreadCount;
    setUnreadCount(0);

    // Update cache for both all and unread views
    queryClient.setQueryData(
      ['notifications', telegramId, 'all'],
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((item: any) => ({ ...item, read_status: true }))
          )
        };
      }
    );

    // Clear unread notifications view
    queryClient.setQueryData(
      ['notifications', telegramId, 'unread'],
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: []
        };
      }
    );

    // Update the unread count cache
    const cachedCountData = localStorage.getItem(`unreadCount_${telegramId}`);
    if (cachedCountData) {
      const { timestamp } = JSON.parse(cachedCountData);
      localStorage.setItem(
        `unreadCount_${telegramId}`,
        JSON.stringify({ count: 0, timestamp })
      );
    }

    try {
      // Send API request
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`,
        null,
        { params: { telegram_id: telegramId } }
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on failure
      setUnreadCount(previousCount);
    }
  }, [telegramId, unreadCount, queryClient]);

  // Invalidate notification queries
  const invalidateNotifications = useCallback(() => {
    if (!telegramId) return;

    queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
    queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });

    // Clear cache
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