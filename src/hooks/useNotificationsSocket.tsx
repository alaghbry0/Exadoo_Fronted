// hooks/useNotificationsSocket.tsx
import { useEffect, useRef, useCallback } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!telegramId || !isMounted.current) return;

    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/notifications`);
    url.searchParams.set('telegram_id', telegramId);

    const socket = new WebSocket(url.toString());
    socketRef.current = socket;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') return;
        onMessage(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    const handleClose = (e: CloseEvent) => {
      if (!isMounted.current) return;
      console.log(`WebSocket closed (code: ${e.code}), reconnecting...`);
      scheduleReconnect();
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);

    // إرسال ping كل 25 ثانية
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      clearInterval(pingInterval);
    };
  }, [telegramId, onMessage]);

  const scheduleReconnect = useCallback(() => {
    if (!isMounted.current) return;

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;

    setTimeout(() => {
      if (isMounted.current) connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return null;
}