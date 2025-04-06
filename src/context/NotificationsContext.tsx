// context/NotificationsContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket';
import { showToast } from '@/components/ui/Toast';
import { useTelegram } from '@/context/TelegramContext';

interface NotificationMessage {
  type: string;
  data?: {
    message?: string;
    invite_link?: string;
    expiry_date?: string;
    count?: number;
  };
}

interface NotificationsContextProps {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
  isNotificationsConnected: boolean;
  markNotificationAsRead: (notificationId: number) => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationsConnected, setIsNotificationsConnected] = useState<boolean>(false);
  const { telegramId, isTelegramReady } = useTelegram();

  // معالج الرسائل الواردة من WebSocket
  const handleNotificationMessage = useCallback((data: NotificationMessage) => {
    console.log("Notification received:", data);

    // تحديث عدد الإشعارات غير المقروءة
    if (data.type === "unread_update" && data.data?.count !== undefined) {
      setUnreadCount(data.data.count);
    }

    // معالجة إشعار تجديد الاشتراك
    if (data.type === "subscription_renewal") {
      showToast.success({
        message: data.data?.message || 'تم تجديد الاشتراك بنجاح',
        action: data.data?.invite_link
          ? {
              text: 'انضم الآن',
              onClick: () => {
                if (data.data?.invite_link) {
                  window.open(data.data.invite_link, '_blank');
                }
              }
            }
          : undefined
      });
    }

    // معالجة تأكيد الاتصال
    if (data.type === "connection_established") {
      console.log("WebSocket connection confirmed:", data);
    }
  }, []);

  // استخدام الهوك المحسن للاتصال بـ WebSocket
  const { isConnected } = useNotificationsSocket<NotificationMessage>(
    telegramId,
    handleNotificationMessage
  );

  // تحديث حالة الاتصال
  useEffect(() => {
    setIsNotificationsConnected(isConnected);
  }, [isConnected]);

  // جلب عدد الإشعارات غير المقروءة من الواجهة الخلفية
  const fetchUnreadCount = useCallback(async () => {
    if (!telegramId || !isTelegramReady) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count?telegram_id=${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.count !== undefined) {
          setUnreadCount(data.count);
        }
      } else {
        console.error("Failed to fetch unread count:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  }, [telegramId, isTelegramReady]);

  // تحديث عدد الإشعارات غير المقروءة عند تحميل التطبيق
  useEffect(() => {
    if (telegramId && isTelegramReady) {
      fetchUnreadCount();
    }
  }, [telegramId, isTelegramReady, fetchUnreadCount]);

  // وظيفة لتحديد إشعار كمقروء
  const markNotificationAsRead = useCallback(async (notificationId: number): Promise<boolean> => {
    if (!telegramId) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          notification_id: notificationId
        }),
      });

      if (response.ok) {
        // تقليل عدد الإشعارات غير المقروءة
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }, [telegramId]);

  return (
    <NotificationsContext.Provider value={{
      unreadCount,
      setUnreadCount,
      fetchUnreadCount,
      isNotificationsConnected,
      markNotificationAsRead
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