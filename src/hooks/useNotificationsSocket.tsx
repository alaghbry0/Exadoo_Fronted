import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type NotificationEventType =
  | 'connection_established'
  | 'unread_update'
  | 'new_notification'
  | 'notification_read'
  | 'ping'
  | 'subscription_renewal';

export interface NotificationMessage<T = unknown> {
  type: NotificationEventType;
  data?: T;
}

export function useNotificationsSocket(
  telegramId: string | null,
  onMessage: (data: NotificationMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const messageQueueRef = useRef<NotificationMessage[]>([]);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);
  const isMounted = useRef(false);
  const queryClient = useQueryClient();

  // Keep track of mount state to prevent memory leaks
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle ping messages from server
  const handlePing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "pong" }));
    }
  }, []);

  // Mark notifications as read via WebSocket
  const markAllAsRead = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && telegramId) {
      socketRef.current.send(JSON.stringify({
        type: "mark_as_read",
        data: { telegram_id: telegramId }
      }));

      // Optimistic update
      queryClient.setQueryData(['unreadNotificationsCount', telegramId], 0);
    }
  }, [telegramId, queryClient]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!telegramId || !isMounted.current) return;

    setConnectionState('connecting');

    // Close existing connection
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    const socketUrl = `${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws?telegram_id=${telegramId}`;

    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted.current) return;

        console.log("✅ WebSocket connected");
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          if (msg) {
            socket.send(JSON.stringify(msg));
          }
        }
      };

      socket.onmessage = (event) => {
        if (!isMounted.current) return;

        try {
          const data: NotificationMessage = JSON.parse(event.data);

          if (data.type === "ping") {
            handlePing();
            return;
          }

          // Handle other messages
          onMessage(data);

          // معالجة خاصة لكل نوع من الرسائل
          if (data.type === 'new_notification') {
            const newNotification = data.data as any;

            // تحديث عداد الإشعارات غير المقروءة
            queryClient.setQueryData(
              ['unreadNotificationsCount', telegramId],
              (oldCount: number) => (oldCount || 0) + 1
            );

            // إضافة الإشعار الجديد إلى كلا النوعين من القوائم (الكل وغير المقروءة)
            ['all', 'unread'].forEach(filterType => {
              queryClient.setQueryData(
                ['notifications', telegramId, filterType],
                (oldData: any) => {
                  if (!oldData || !oldData.pages || !oldData.pages[0]) return oldData;

                  // إنشاء نسخة جديدة من الصفحات مع الإشعار الجديد في المقدمة
                  const updatedPages = [...oldData.pages];

                  if (updatedPages[0] && Array.isArray(updatedPages[0])) {
                    // إضافة الإشعار الجديد في بداية المصفوفة
                    updatedPages[0] = [newNotification, ...updatedPages[0]];

                    // اختياري: لا تدع القائمة تزيد عن 10 عناصر في الصفحة الأولى
                    if (updatedPages[0].length > 10) {
                      updatedPages[0] = updatedPages[0].slice(0, 10);
                    }
                  }

                  return {
                    ...oldData,
                    pages: updatedPages
                  };
                }
              );
            });
          }
          else if (data.type === 'notification_read') {
            // تحديث حالة قراءة الإشعار
            const readNotificationId = (data.data as any)?.notification_id;

            if (readNotificationId) {
              // تحديث حالة القراءة في قائمة 'الكل'
              queryClient.setQueryData(
                ['notifications', telegramId, 'all'],
                (oldData: any) => {
                  if (!oldData) return oldData;

                  return {
                    ...oldData,
                    pages: oldData.pages.map((page: any[]) =>
                      page.map(notification =>
                        notification.id === readNotificationId
                          ? { ...notification, read_status: true }
                          : notification
                      )
                    )
                  };
                }
              );

              // إزالة الإشعار من قائمة 'غير المقروءة'
              queryClient.setQueryData(
                ['notifications', telegramId, 'unread'],
                (oldData: any) => {
                  if (!oldData) return oldData;

                  return {
                    ...oldData,
                    pages: oldData.pages.map((page: any[]) =>
                      page.filter(notification => notification.id !== readNotificationId)
                    ).filter(page => page.length > 0)
                  };
                }
              );
            }
          }
          else if (data.type === 'unread_update') {
            // تحديث عدد الإشعارات غير المقروءة
            const unreadData = data.data as { count?: number };
            if (unreadData?.count !== undefined) {
              queryClient.setQueryData(
                ['unreadNotificationsCount', telegramId],
                unreadData.count
              );
            }
          }

        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionState('disconnected');
      };

      socket.onclose = (e) => {
        if (!isMounted.current) return;

        console.log(`🔌 WebSocket closed (code: ${e.code})`);
        setConnectionState('disconnected');

        // Attempt reconnect for abnormal closures
        if (e.code !== 1000 && e.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(5000, 1000 * Math.pow(2, reconnectAttemptsRef.current));
            reconnectAttemptsRef.current++;

            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                console.log(`🔄 Reconnecting... (Attempt ${reconnectAttemptsRef.current})`);
                connect();
              }
            }, delay);
          }
        }
      };
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      setConnectionState('disconnected');
    }
  }, [telegramId, handlePing, onMessage, queryClient]);

  // Send message to WebSocket server
  const sendMessage = useCallback((message: NotificationMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    } else {
      messageQueueRef.current.push(message);
      return false;
    }
  }, []);

  // Connect when telegramId changes
  useEffect(() => {
    if (!telegramId) return;
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmount");
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect, telegramId]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    sendMessage,
    markAllAsRead
  };
}
