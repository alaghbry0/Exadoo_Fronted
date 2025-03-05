// components/SubscriptionStatusListener.tsx
'use client';
import React, { useEffect, useState } from 'react';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import { useTelegram } from '../context/TelegramContext';

const SubscriptionStatusListener: React.FC = () => {
  const { telegramId } = useTelegram();
  const [wsMessage, setWsMessage] = useState<{ invite_link?: string; message?: string } | null>(null);

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
          setWsMessage({ invite_link: data.invite_link, message: data.message });
          // تخزين البيانات في Local Storage مع توقيت الاستلام
          localStorage.setItem(
            'subscriptionData',
            JSON.stringify({
              invite_link: data.invite_link,
              message: data.message,
              timestamp: new Date().getTime()
            })
          );
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

  return (
    <>
      {wsMessage && wsMessage.invite_link && (
        <PaymentSuccessModal
          inviteLink={wsMessage.invite_link}
          message={wsMessage.message || "يمكنك الآن الانضمام إلى القناة"}
          onClose={() => setWsMessage(null)}
        />
      )}
    </>
  );
};

export default SubscriptionStatusListener;
