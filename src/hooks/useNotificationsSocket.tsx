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
  const maxReconnectAttempts = 5; // يمكنك زيادة هذا الرقم إذا لزم الأمر
  const reconnectAttemptsRef = useRef(0);
  const isMounted = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "pong" }));
      // console.log("🏓 Pong sent"); // لإلغاء التعليق عند الحاجة للتتبع
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && telegramId) {
      socketRef.current.send(
        JSON.stringify({
          type: "mark_as_read",
          data: { telegram_id: telegramId }
        })
      );
      queryClient.setQueryData(['unreadNotificationsCount', telegramId], 0);
    }
  }, [telegramId, queryClient]);

  const connect = useCallback(() => {
    if (!telegramId || !isMounted.current) {
      if (!telegramId) console.log("ℹ️ WebSocket connect aborted: telegramId is null.");
      if (!isMounted.current) console.log("ℹ️ WebSocket connect aborted: component unmounted.");
      return;
    }

    setConnectionState('connecting');
    console.log(`🟠 Connecting to WebSocket with telegram_id: ${telegramId}`);


    if (socketRef.current) {
      console.log("ℹ️ Closing existing WebSocket connection before reconnecting.");
      try {
        socketRef.current.onclose = null; // تجنب تفعيل onclose القديم
        socketRef.current.onerror = null;
        socketRef.current.onmessage = null;
        socketRef.current.onopen = null;
        socketRef.current.close(1000, "Reconnecting"); // أغلق الاتصال الحالي بشكل طبيعي
      } catch (err) {
        console.warn("⚠️ Error closing existing socket:", err);
      }
      socketRef.current = null;
    }

    // مسح أي مؤقت لإعادة الاتصال معلق
    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
    }


    const socketUrl = `${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws?telegram_id=${telegramId}`;

    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN && isMounted.current) {
          console.warn(`⚠️ WebSocket connection attempt timed out after 10 seconds. URL: ${socketUrl}`);
          socket.close(); // سيؤدي هذا إلى تفعيل onclose
          // لا نضبط setConnectionState('disconnected') هنا مباشرة، دع onclose يتعامل معها.
        }
      }, 10000); // مهلة 10 ثوانٍ للاتصال

      socket.onopen = () => {
        if (!isMounted.current) return;
        clearTimeout(connectionTimeout);
        console.log("✅ WebSocket connected");
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0; // إعادة تعيين عداد محاولات إعادة الاتصال عند النجاح

        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          if (msg) {
            console.log("📦 Sending queued message:", msg);
            socket.send(JSON.stringify(msg));
          }
        }
      };

      socket.onmessage = (event) => {
        if (!isMounted.current) return;
        try {
          // console.log("📩 WebSocket message received (raw):", event.data); // لإلغاء التعليق عند الحاجة للتتبع
          const data: NotificationMessage = JSON.parse(event.data as string);
          // console.log("📩 WebSocket message parsed:", data); // لإلغاء التعليق عند الحاجة للتتبع

          if (data.type === "ping") {
            // console.log("🔔 Ping received"); // لإلغاء التعليق عند الحاجة للتتبع
            handlePing();
            return;
          }

          if (data.type === 'connection_established') {
            // console.log("🤝 Connection established message from server:", data.data); // لإلغاء التعليق عند الحاجة للتتبع
          }

          onMessage(data); // تمرير الرسالة للمعالج الخارجي (في _app.tsx)

          // التحديثات المتفائلة لـ React Query
          if (data.type === 'new_notification') {
            const newNotification = data.data as unknown; // افترض أن data.data هو الإشعار الجديد
            queryClient.setQueryData(
              ['unreadNotificationsCount', telegramId],
              (oldCount: number | undefined) => (oldCount || 0) + 1
            );
            ['all', 'unread'].forEach(filterType => {
              queryClient.setQueryData(
                ['notifications', telegramId, filterType],
                (oldData: { pages: Array<Array<unknown>> } | undefined) => {
                  if (!oldData || !oldData.pages || oldData.pages.length === 0 || !oldData.pages[0]) {
                    // إذا لم تكن هناك بيانات قديمة أو صفحات، أنشئها
                    return { pages: [[newNotification]], pageParams: [undefined] };
                  }
                  const updatedPages = oldData.pages.map((page, index) =>
                    index === 0 ? [newNotification, ...page] : page
                  );
                  // التأكد من عدم تجاوز حجم الصفحة (اختياري، إذا كنت تطبق ترقيما للصفحات محدود الحجم من جانب العميل)
                  // if (updatedPages[0].length > 10) {
                  //   updatedPages[0] = updatedPages[0].slice(0, 10);
                  // }
                  return {
                    ...oldData,
                    pages: updatedPages
                  };
                }
              );
            });
          } else if (data.type === 'notification_read') {
            interface ReadNotificationData { notification_id: string; }
            const readNotificationId = (data.data as ReadNotificationData)?.notification_id;
            if (readNotificationId) {
              queryClient.setQueryData(
                ['unreadNotificationsCount', telegramId],
                (oldCount: number | undefined) => Math.max(0, (oldCount || 0) - 1)
              );
              // تحديث حالة القراءة في قائمة 'all'
              queryClient.setQueryData(
                ['notifications', telegramId, 'all'],
                (oldData: { pages: Array<Array<{ id: string, read_status: boolean }>> } | undefined) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    pages: oldData.pages.map(page =>
                      page.map(notification =>
                        notification.id === readNotificationId
                          ? { ...notification, read_status: true }
                          : notification
                      )
                    )
                  };
                }
              );
              // إزالة الإشعار من قائمة 'unread'
              queryClient.setQueryData(
                ['notifications', telegramId, 'unread'],
                (oldData: { pages: Array<Array<{ id: string }>> } | undefined) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    pages: oldData.pages.map(page =>
                      page.filter(notification => notification.id !== readNotificationId)
                    ).filter(page => page.length > 0) // إزالة الصفحات الفارغة
                  };
                }
              );
            }
          } else if (data.type === 'unread_update') {
            const unreadData = data.data as { count?: number };
            if (unreadData?.count !== undefined) {
              queryClient.setQueryData(['unreadNotificationsCount', telegramId], unreadData.count);
            }
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message or updating cache:", error, "Raw data:", event.data);
        }
      };

      socket.onerror = (errorEvent) => {
        clearTimeout(connectionTimeout);
        // لا يوجد الكثير من التفاصيل في errorEvent عادةً، onclose أكثر فائدة
        console.error("❌ WebSocket error:", errorEvent);
        // setConnectionState('disconnected'); // سيتم التعامل مع هذا بواسطة onclose
      };

      socket.onclose = (e) => {
        clearTimeout(connectionTimeout);
        if (!isMounted.current) return;

        console.log(`🔌 WebSocket closed. Code: ${e.code}, Reason: '${e.reason}', Was Clean: ${e.wasClean}`);
        setConnectionState('disconnected');
        socketRef.current = null; // تأكد من مسح المرجع

        // إعادة الاتصال فقط إذا لم يكن الإغلاق طبيعياً (1000) أو بسبب انتقال الصفحة (1001)
        // أو إذا لم يكن بسبب unmount (والتي يجب أن تغلق برمز 1000)
        if (e.code !== 1000 && e.code !== 1001) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            // زيادة التأخير بشكل أسي، بحد أقصى 30 ثانية
            const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttemptsRef.current));
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting WebSocket... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay / 1000}s`);
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) { // تحقق مرة أخرى قبل الاتصال
                connect();
              }
            }, delay);
          } else {
            console.log(`🚫 Max WebSocket reconnect attempts reached (${maxReconnectAttempts}). Giving up.`);
          }
        } else {
             // إذا كان الإغلاق طبيعياً، أعد تعيين عداد المحاولات
            reconnectAttemptsRef.current = 0;
        }
      };
    } catch (error) {
      console.error("❌ WebSocket connection failed to initiate:", error);
      setConnectionState('disconnected'); // تأكد من تحديث الحالة في حال فشل new WebSocket()
      // قد ترغب في محاولة إعادة الاتصال هنا أيضًا إذا كان الخطأ من النوع الذي يمكن التعافي منه
      // لكن هذا أقل شيوعاً، عادةً ما يتم التعامل مع أخطاء الاتصال عبر onclose
    }
  // إزالة التأخير الداخلي `setTimeout(..., 2000)` من هنا.
  }, [telegramId, handlePing, onMessage, queryClient, maxReconnectAttempts]); // أضفت maxReconnectAttempts للاتساق


  const sendMessage = useCallback((message: NotificationMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.log("⚠️ WebSocket not open. Queuing message:", message);
      messageQueueRef.current.push(message);
      // قد ترغب في محاولة الاتصال إذا لم يكن متصلاً أو في طور الاتصال
      if (connectionState === 'disconnected') {
          console.log("💡 Attempting to connect WebSocket due to pending message.");
          connect();
      }
      return false;
    }
  }, [connectionState, connect]);

  useEffect(() => {
    if (telegramId && isMounted.current) { // تأكد من أن المكون ما زال mounted
      connect();
    } else if (!telegramId) {
        // إذا تم تعيين telegramId إلى null (مثل تسجيل الخروج)
        if (socketRef.current) {
            console.log("ℹ️ Closing WebSocket connection due to telegramId becoming null.");
            socketRef.current.onclose = null; // تجنب إعادة الاتصال غير المرغوب فيها
            socketRef.current.close(1000, "User logged out or telegramId removed");
            socketRef.current = null;
        }
        setConnectionState('disconnected');
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        reconnectAttemptsRef.current = 0; // إعادة تعيين محاولات إعادة الاتصال
    }

    return () => {
      console.log("ℹ️ Cleaning up WebSocket connection on component unmount or telegramId change.");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        // لا تقم بتعيين onclose إلى null هنا، فقد تحتاج إليه لتنظيف الحالة
        // ولكن يمكنك التأكد من عدم محاولة إعادة الاتصال
        socketRef.current.close(1000, "Component unmounting"); // رمز 1000 إغلاق طبيعي
        socketRef.current = null;
      }
      // لا تقم بإعادة تعيين reconnectAttemptsRef هنا، فقد يكون هناك تغيير في telegramId يتطلب الحفاظ على الحالة
    };
  }, [connect, telegramId]); // `connect` هنا كمُعتمدية

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    sendMessage,
    markAllAsRead
  };
}