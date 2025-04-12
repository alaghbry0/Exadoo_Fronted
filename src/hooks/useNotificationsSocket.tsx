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

  // تتبع حالة المكون (mounted) لتجنب تسرب الذاكرة
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // معالجة رسائل الـ "ping" من الخادم
  const handlePing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "pong" }));
    }
  }, []);

  // دالة لتعليم كل الإشعارات كمقروءة عبر الـ WebSocket
  const markAllAsRead = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && telegramId) {
      socketRef.current.send(
        JSON.stringify({
          type: "mark_as_read",
          data: { telegram_id: telegramId }
        })
      );
      // تحديث عداد الإشعارات غير المقروءة بشكل متفائل
      queryClient.setQueryData(['unreadNotificationsCount', telegramId], 0);
    }
  }, [telegramId, queryClient]);

  // دالة الاتصال بالـ WebSocket مع تأخير 2 ثانية وتحسين معالجة الأخطاء
  const connect = useCallback(() => {
    if (!telegramId || !isMounted.current) return;

    setConnectionState('connecting');

    // إغلاق الاتصال الحالي إن وجد
    if (socketRef.current) {
      try {
        socketRef.current.onclose = null;
        socketRef.current.close();
      } catch (err) {
        console.warn("Error closing existing socket:", err);
      }
      socketRef.current = null;
    }

    const socketUrl = `${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws?telegram_id=${telegramId}`;

    // تأخير محاولة الاتصال لمدة 2 ثانية لتجنب تعليق واجهة المستخدم
    setTimeout(() => {
      if (!isMounted.current) return;
      try {
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        // تحديد مهلة للاتصال للتعامل مع الحالات المعلقة (10 ثواني)
        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN && isMounted.current) {
            console.warn("WebSocket connection timeout");
            socket.close();
            setConnectionState('disconnected');
          }
        }, 10000);

        socket.onopen = () => {
          if (!isMounted.current) return;
          clearTimeout(connectionTimeout);
          console.log("✅ WebSocket connected");
          setConnectionState('connected');
          reconnectAttemptsRef.current = 0;

          // إرسال الرسائل المؤجلة في حال كانت موجودة
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

            // التعامل مع باقي الرسائل
            onMessage(data);

            // معالجة خاصة لنوع "new_notification"
            if (data.type === 'new_notification') {
              const newNotification = data.data as unknown;
              queryClient.setQueryData(
                ['unreadNotificationsCount', telegramId],
                (oldCount: number) => (oldCount || 0) + 1
              );

              // تحديث قوائم الإشعارات (الكل وغير المقروءة)
              ['all', 'unread'].forEach(filterType => {
                queryClient.setQueryData(
                  ['notifications', telegramId, filterType],
                  (oldData: { pages: Array<Array<unknown>> }) => {
                    if (!oldData || !oldData.pages || !oldData.pages[0]) return oldData;

                    // إنشاء نسخة جديدة من الصفحات وإضافة الإشعار الجديد في المقدمة
                    const updatedPages = [...oldData.pages];
                    if (updatedPages[0] && Array.isArray(updatedPages[0])) {
                      updatedPages[0] = [newNotification, ...updatedPages[0]];
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
            } else if (data.type === 'notification_read') {
              // معالجة تحديث حالة قراءة الإشعار
              interface ReadNotificationData {
                notification_id: string;
              }
              const readNotificationId = (data.data as ReadNotificationData)?.notification_id;
              if (readNotificationId) {
                queryClient.setQueryData(
                  ['notifications', telegramId, 'all'],
                  (oldData: { pages: Array<Array<{ id: string }>> }) => {
                    if (!oldData) return oldData;
                    return {
                      ...oldData,
                      pages: oldData.pages.map((page: Array<{ id: string }>) =>
                        page.map(notification =>
                          notification.id === readNotificationId
                            ? { ...notification, read_status: true }
                            : notification
                        )
                      )
                    };
                  }
                );
                queryClient.setQueryData(
                  ['notifications', telegramId, 'unread'],
                  (oldData: { pages: Array<Array<{ id: string }>> }) => {
                    if (!oldData) return oldData;
                    return {
                      ...oldData,
                      pages: oldData.pages
                        .map((page: Array<{ id: string }>) =>
                          page.filter(notification => notification.id !== readNotificationId)
                        )
                        .filter(page => page.length > 0)
                    };
                  }
                );
              }
            } else if (data.type === 'unread_update') {
              // تحديث عدد الإشعارات غير المقروءة
              const unreadData = data.data as { count?: number };
              if (unreadData?.count !== undefined) {
                queryClient.setQueryData(['unreadNotificationsCount', telegramId], unreadData.count);
              }
            }
          } catch (error) {
            console.error("❌ Error parsing message:", error);
          }
        };

        socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error("❌ WebSocket error:", error);
          setConnectionState('disconnected');
        };

        socket.onclose = (e) => {
          clearTimeout(connectionTimeout);
          if (!isMounted.current) return;

          console.log(`🔌 WebSocket closed (code: ${e.code})`);
          setConnectionState('disconnected');

          // محاولة إعادة الاتصال إذا كان الإغلاق غير طبيعي
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
    }, 2000); // تأخير 2 ثانية قبل محاولة الاتصال
  }, [telegramId, handlePing, onMessage, queryClient, maxReconnectAttempts]);

  // دالة لإرسال الرسائل عبر WebSocket
  const sendMessage = useCallback((message: NotificationMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    } else {
      messageQueueRef.current.push(message);
      return false;
    }
  }, []);

  // الاتصال عند تغيير قيمة telegramId
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
