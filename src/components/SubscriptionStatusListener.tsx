// components/SubscriptionStatusListener.tsx
'use client';
import React, { useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';

const SubscriptionStatusListener: React.FC = () => {
  const { telegramId } = useTelegram();

  useEffect(() => {
    if (!telegramId) return;

    const websocket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS_URL}/ws/subscription_status`);

    websocket.onopen = () => {
      console.log("WebSocket connection opened");
      websocket.send(JSON.stringify({ telegram_id: parseInt(telegramId) }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket data:", data);
        if (data.status === "active" && data.invite_link) {
          // قم بتخزين البيانات في Local Storage مع توقيت الاستلام
          const subscriptionData = {
            invite_link: data.invite_link,
            message: data.message,
            timestamp: new Date().getTime(),
          };
          localStorage.setItem('subscriptionData', JSON.stringify(subscriptionData));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.close();
    };
  }, [telegramId]);

  return null;
};

export default SubscriptionStatusListener;
