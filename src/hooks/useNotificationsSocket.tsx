import { useEffect, useRef, useCallback, useState } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | number | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 10; // زيادة عدد المحاولات
  const baseReconnectDelay = 2000;
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const connectingRef = useRef<boolean>(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongTimeRef = useRef<number>(Date.now());

  const connect = useCallback(() => {
    if (!telegramId || connectingRef.current) return;

    connectingRef.current = true;

    // إغلاق الاتصال السابق إذا كان موجودًا
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }

    try {
      // تحويل معرف التليجرام إلى سلسلة نصية للتأكد من اتساق النوع
      const stringTelegramId = String(telegramId);
      const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/notifications?telegram_id=${stringTelegramId}`;

      console.log(`🔄 محاولة الاتصال بـ WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ تم الاتصال بـ WebSocket بنجاح");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        connectingRef.current = false;
        lastPongTimeRef.current = Date.now();

        // بدء مراقبة استجابة الخادم
        startPingMonitoring();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // console.log("📩 تم استلام رسالة WebSocket:", data);

          // تحديث وقت آخر رد عند استلام pong
          if (data.type === "pong") {
            lastPongTimeRef.current = Date.now();
            return; // لا تمرر رسائل ping/pong للمستخدم
          }

          onMessage(data);
        } catch (error) {
          console.error("❌ خطأ في تحليل رسالة WebSocket:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ خطأ في WebSocket:", error);
        setIsConnected(false);
        connectingRef.current = false;
      };

      socket.onclose = (e) => {
        console.log(`🔌 تم إغلاق WebSocket برمز: ${e.code}, السبب: "${e.reason}", إغلاق نظيف: ${e.wasClean}`);
        setIsConnected(false);
        connectingRef.current = false;
        stopPingMonitoring();


        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            baseReconnectDelay * Math.pow(1.5, reconnectAttemptsRef.current),
            30000
          );

          console.log(`🔄 جدولة محاولة إعادة الاتصال ${reconnectAttemptsRef.current + 1} خلال ${delay}ms`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 جاري محاولة إعادة الاتصال بـ WebSocket...");
            reconnectAttemptsRef.current += 1;
            connect();
            reconnectTimeoutRef.current = null;
          }, delay);
        } else {
          console.warn(`⚠️ تم الوصول إلى الحد الأقصى من محاولات إعادة الاتصال (${maxReconnectAttempts})`);
        }
      };
    } catch (error) {
      console.error("❌ فشل في تهيئة WebSocket:", error);
      connectingRef.current = false;
    }
  }, [telegramId, onMessage]);

  // مراقبة استجابة الخادم عبر ping/pong
  const startPingMonitoring = useCallback(() => {
    stopPingMonitoring();

    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        // إرسال ping للخادم
        socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));

        // التحقق من وقت آخر pong
        const timeSinceLastPong = Date.now() - lastPongTimeRef.current;
        if (timeSinceLastPong > 30000) { // 30 ثانية بدون استجابة
          console.warn("⚠️ لم يتم استلام استجابة ping لمدة 30 ثانية، إعادة إنشاء الاتصال");
          if (socketRef.current) {
            socketRef.current.close();
          }
        }
      }
    }, 10000); // ping كل 10 ثواني

    pingIntervalRef.current = pingInterval;
  }, []);

  const stopPingMonitoring = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // إعادة إنشاء الاتصال عند تغيير معرف المستخدم
  useEffect(() => {
    // تنظيف الاتصال السابق
    const cleanup = () => {
      stopPingMonitoring();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      setIsConnected(false);
      connectingRef.current = false;
    };

    cleanup();

    // إنشاء اتصال جديد إذا كان هناك معرف مستخدم
    if (telegramId) {
      connect();
    }

    return cleanup;
  }, [telegramId, connect, stopPingMonitoring]);

  // إعادة محاولة الاتصال عند استعادة اتصال الشبكة
  useEffect(() => {
    const handleOnline = () => {
      console.log("🔄 عادت الشبكة للعمل، إعادة الاتصال بـ WebSocket");
      reconnectAttemptsRef.current = 0;
      connect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("🔄 عادت الصفحة للظهور، التحقق من اتصال WebSocket");
        // إعادة الاتصال فقط إذا كان مغلقًا
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
          reconnectAttemptsRef.current = 0;
          connect();
        }
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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