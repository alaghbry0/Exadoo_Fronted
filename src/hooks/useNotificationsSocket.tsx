// hooks/useNotificationsSocket.tsx
import { useEffect, useRef, useCallback } from 'react';

export function useNotificationsSocket<T = unknown>(
  telegramId: string | null,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);

  const handlePong = useCallback(() => {
    reconnectAttempts.current = 0; // Reset reconnect attempts on successful pong
  }, []);

  const connect = useCallback(() => {
    if (!telegramId || !isMounted.current) return;

    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/notifications`);
    url.searchParams.set('telegram_id', telegramId);

    const socket = new WebSocket(url.toString());
    socketRef.current = socket;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong' }));
          handlePong();
          return;
        }
        onMessage(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    const handleError = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    const handleClose = (e: CloseEvent) => {
      if (!isMounted.current) return;
      console.log(`WebSocket closed (code: ${e.code}), reconnecting...`);
      scheduleReconnect();
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('close', handleClose);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('close', handleClose);
    };
  }, [telegramId, onMessage, handlePong]);

  const scheduleReconnect = useCallback(() => {
    if (!isMounted.current) return;

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 60000);
    reconnectAttempts.current += 1;

    const timeoutId = setTimeout(() => {
      if (isMounted.current) connect();
    }, delay);

    return () => clearTimeout(timeoutId);
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