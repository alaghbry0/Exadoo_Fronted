// تعديل في useNotificationsSocket.tsx
import { useEffect, useRef, useCallback, useState } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | number | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000;
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const connectingRef = useRef<boolean>(false); // متغير جديد لتتبع حالة الاتصال الجارية

  const connect = useCallback(() => {
    if (!telegramId || connectingRef.current) return; // منع الاتصال المتزامن

    connectingRef.current = true; // تعيين حالة الاتصال الجارية

    // إغلاق الاتصال السابق إذا كان موجودًا
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }

    try {
      // تحويل معرف التليجرام إلى سلسلة نصية للتأكد من اتساق النوع
      const stringTelegramId = String(telegramId);
      // استخدام wss بدلاً من https لاتصال WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostWithoutProtocol = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}//${hostWithoutProtocol}/ws/notifications?telegram_id=${stringTelegramId}`;

      console.log(`Connecting to WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // إعادة تعيين عدد محاولات إعادة الاتصال
        connectingRef.current = false; // إعادة تعيين حالة الاتصال

        // إرسال رسالة ping للتأكد من أن الاتصال نشط
        socket.send(JSON.stringify({ type: 'ping' }));

        // بدء إرسال رسائل ping دورية للحفاظ على الاتصال
        const pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // كل 30 ثانية

        // تخزين مرجع الفاصل الزمني للتنظيف لاحقًا
        socketRef.current!.pingInterval = pingInterval;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          onMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        connectingRef.current = false; // إعادة تعيين حالة الاتصال عند حدوث خطأ
      };

      socket.onclose = (e) => {
        console.log(`WebSocket closed with code: ${e.code}, reason: ${e.reason}, wasClean: ${e.wasClean}`);
        setIsConnected(false);
        connectingRef.current = false; // إعادة تعيين حالة الاتصال عند الإغلاق

        // إيقاف ping إذا كان نشطًا
        if (socketRef.current?.pingInterval) {
          clearInterval(socketRef.current.pingInterval);
        }

        // محاولة إعادة الاتصال مع زيادة الفترة الزمنية تدريجياً
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(1.5, reconnectAttemptsRef.current);
          console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            reconnectAttemptsRef.current += 1;
            connect();
            reconnectTimeoutRef.current = null;
          }, delay);
        } else {
          console.warn(`Maximum reconnect attempts (${maxReconnectAttempts}) reached`);
        }
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      connectingRef.current = false; // إعادة تعيين حالة الاتصال عند حدوث استثناء
    }
  }, [telegramId, onMessage]);

  // الكود الحالي لمعالجة تغيير معرف المستخدم
  useEffect(() => {
    // تنظيف الاتصال السابق
    const cleanup = () => {
      if (socketRef.current) {
        if (socketRef.current.pingInterval) {
          clearInterval(socketRef.current.pingInterval);
        }
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setIsConnected(false);
      connectingRef.current = false; // إعادة تعيين حالة الاتصال
    };

    cleanup();

    // إنشاء اتصال جديد إذا كان هناك معرف مستخدم
    if (telegramId) {
      connect();
    }

    return cleanup;
  }, [telegramId, connect]);

  // إعادة محاولة الاتصال عند استعادة اتصال الشبكة
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is back online, reconnecting WebSocket");
      reconnectAttemptsRef.current = 0; // إعادة تعيين العداد
      connect();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [connect]);

  return { isConnected };
}

// إضافة النوع للتعرف على الخصائص المخصصة
declare global {
  interface WebSocket {
    pingInterval?: NodeJS.Timeout;
  }
}