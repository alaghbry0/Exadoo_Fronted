import { useEffect, useRef, useCallback, useState } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL = 2000; // زيادة تدريجية مع عدد المحاولات
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connect = useCallback(() => {
    if (!telegramId) return;

    // إغلاق أي اتصال سابق
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }

    try {
      console.log(`محاولة الاتصال بـ WebSocket لـ ${telegramId}...`);
      const socket = new WebSocket(`${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws/notifications?telegram_id=${telegramId}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket متصل بنجاح");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // إعادة تعيين عدد المحاولات عند النجاح

        // إرسال ping للتأكد من استمرار الاتصال
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error("❌ خطأ في تحليل رسالة WebSocket:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ خطأ في WebSocket:", error);
        setIsConnected(false);
      };

      socket.onclose = (e) => {
        console.log(`WebSocket مغلق. كود: ${e.code}, سبب: ${e.reason || 'غير معروف'}, نظيف: ${e.wasClean}`);
        setIsConnected(false);

        // إعادة الاتصال تلقائيًا مع زيادة وقت الانتظار تدريجياً
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delayMs = Math.min(RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
          console.log(`محاولة إعادة الاتصال بعد ${delayMs}ms (محاولة ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
            reconnectTimeoutRef.current = null;
          }, delayMs);
        } else {
          console.error("⚠️ توقف عن محاولات إعادة الاتصال بعد عدة محاولات فاشلة");
        }
      };
    } catch (error) {
      console.error("❌ خطأ في إنشاء اتصال WebSocket:", error);
    }
  }, [telegramId, onMessage]);

  // وظيفة لإعادة الاتصال يدويًا
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0; // إعادة تعيين العدّاد
    connect();
  }, [connect]);

  // إنشاء اتصال عندما يكون telegramId متاحًا
  useEffect(() => {
    if (telegramId) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [telegramId, connect]);

  // إنشاء ping متكرر للحفاظ على الاتصال
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // كل 30 ثانية

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return { isConnected, reconnect };
}