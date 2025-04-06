import { useEffect, useRef, useCallback } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!telegramId) return;

    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/notifications?telegram_id=${telegramId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (e) => {
      console.log("WebSocket closed", e);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Reconnecting WebSocket...");
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
