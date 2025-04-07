import { useEffect, useRef, useCallback, useState } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueueRef = useRef<T[]>([]);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);
  
  // معالجة رسائل ping/pong للحفاظ على الاتصال
  const handlePing = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "pong" }));
    }
  }, []);

  const connect = useCallback(() => {
    if (!telegramId) {
      console.error("❌ No Telegram ID provided.");
      return;
    }

    // إغلاق الاتصال القديم إذا كان موجودًا
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }

    const socketUrl = `${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws/notifications?telegram_id=${telegramId}`;
    console.log(`Attempting to connect to WebSocket: ${socketUrl}`);
    
    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // إعادة تعيين عداد محاولات إعادة الاتصال
        
        // إرسال الرسائل المخزنة في القائمة
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
          }
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ping") {
            handlePing();
          } else {
            onMessage(data);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setIsConnected(false);
      };

      socket.onclose = (e) => {
        console.log("🔌 WebSocket closed", e);
        setIsConnected(false);
        
        if (e.code !== 1000 && e.code !== 1001) { // الإغلاق غير الطبيعي
          console.error("❌ Abnormal WebSocket closure:", e.reason);
          
          if (reconnectAttemptsRef.current < maxReconnectAttempts && !reconnectTimeoutRef.current) {
            const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current++;
            
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`🔄 Reconnecting WebSocket... (Attempt ${reconnectAttemptsRef.current})`);
              connect();
              reconnectTimeoutRef.current = null;
            }, backoffTime);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.error("❌ Maximum reconnection attempts reached.");
          }
        }
      };

    } catch (error) {
      console.error("❌ Error creating WebSocket connection:", error);
    }
  }, [telegramId, onMessage, handlePing]);

  // طريقة آمنة لإرسال الرسائل
  const sendMessage = useCallback((message: T) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message as Record<string, unknown>));
    } else {
      // تخزين الرسالة للإرسال بعد إعادة الاتصال
      messageQueueRef.current.push(message as T);
      
      // محاولة إعادة الاتصال إذا لم يكن هناك اتصال مفتوح
      if (!isConnected && !reconnectTimeoutRef.current) {
        connect();
      }
    }
  }, [connect, isConnected]);

  // إعادة الاتصال عند التنقل بين الصفحات
  useEffect(() => {
    // استخدام visibilitychange لاكتشاف عودة المستخدم للصفحة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // التحقق من حالة الاتصال عند العودة للصفحة
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // إنشاء الاتصال عند تحميل المكون
    connect();

    // تنظيف عند إزالة المكون
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // احتفظ بالاتصال مفتوحًا عند التنقل بين الصفحات ولكن إغلاقه عند إزالة المكون بالكامل
      if (socketRef.current) {
        // بدلاً من إغلاق الاتصال فورًا، نضع علامة للإغلاق بعد فترة قصيرة
        // للسماح بالتنقل بين الصفحات دون إغلاق الاتصال
        const socket = socketRef.current;
        setTimeout(() => {
          // إغلاق الاتصال فقط إذا لم يتم إعادة إنشاء مكون جديد
          if (socket === socketRef.current) {
            socket.close(1000, "Component unmounted");
          }
        }, 100);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, sendMessage };
}
