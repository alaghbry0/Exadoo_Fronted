import { useEffect, useRef, useCallback } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!telegramId) {
      console.error("❌ No Telegram ID provided.");
      return;
    }

    const socketUrl = `${process.env.NEXT_PUBLIC_wsBACKEND_URL}/ws/notifications?telegram_id=${telegramId}`;
    console.log(`Attempting to connect to WebSocket: ${socketUrl}`);
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      console.log("🔄 WebSocket message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onclose = (e) => {
      console.log("🔌 WebSocket closed", e);
      if (e.code !== 1000) { // في حال الإغلاق غير الطبيعي
        console.error("❌ Abnormal WebSocket closure:", e.reason);
      }
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Reconnecting WebSocket...");
          connect();
          reconnectTimeoutRef.current = null;
        }, 3000);
      }
    };
  }, [telegramId, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
