// components/SubscriptionStatusListener.tsx
"use client";
import React, { useEffect } from "react";
import { useTelegram } from "@/context/TelegramContext";

const SubscriptionStatusListener: React.FC = () => {
  const { telegramId } = useTelegram();

  useEffect(() => {
    if (!telegramId) return;

    const websocket = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/subscription_status`,
    );

    websocket.onopen = () => {
      console.log("✅ WebSocket connection opened");
      websocket.send(
        JSON.stringify({
          action: "register",
          telegram_id: telegramId.toString(), // التعديل هنا: تحويل إلى سلسلة
        }),
      );
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📥 Received WebSocket data:", data);

        if (data.type === "subscription_success") {
          const subscriptionData = {
            invite_link: data.data.invite_link,
            formatted_message: data.data.formatted_message,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            "subscriptionData",
            JSON.stringify(subscriptionData),
          );
          window.dispatchEvent(
            new CustomEvent("subscription_update", {
              detail: subscriptionData,
            }),
          );
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    // إضافة معالجة حدث الإغلاق
    websocket.onclose = (event) => {
      console.log("🔌 WebSocket connection closed:", event.reason);
      localStorage.removeItem("subscriptionData");
    };

    return () => {
      websocket.close();
      console.log("🔌 WebSocket connection closed intentionally");
    };
  }, [telegramId]);

  return null;
};

export default SubscriptionStatusListener;
