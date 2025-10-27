// TelegramContext.dev.tsx — نسخة متصفح/اختبار (لا تتطلب Telegram WebApp)
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { syncUserData } from "@/shared/api/userSync";

interface TelegramContextType {
  isTelegramReady: boolean;
  isLoading: boolean;
  isTelegramApp: boolean;
  telegramId: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegramReady: false,
  isLoading: true,
  isTelegramApp: false,
  telegramId: null,
});

const DEFAULT_TEST_TELEGRAM_ID = "5113997414";

// اختيارياً: السماح بتمرير telegramId عبر كويري بارام أو localStorage
function resolveTestTelegramId(): string {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get("tgid");
    if (qp && /^\d{5,}$/.test(qp)) return qp;

    const ls = window.localStorage.getItem("dev_telegram_id");
    if (ls && /^\d{5,}$/.test(ls)) return ls;
  }
  return DEFAULT_TEST_TELEGRAM_ID;
}

export const TelegramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setUserData, telegramId: contextTelegramId } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // وضع الاختبار الخالص: لا نحاول استخدام Telegram SDK إطلاقًا.
  useEffect(() => {
    let isMounted = true;

    const bootDevMode = async () => {
      try {
        const testId = resolveTestTelegramId();
        console.log("🧪 DEV MODE: Booting with mocked Telegram ID:", testId);

        // 1) حفظ بيانات المستخدم الأساسية في المتجر
        setUserData({
          telegramId: testId,
          telegramUsername: "dev_user",
          fullName: "Dev Tester",
          photoUrl: null,
          joinDate: null,
        });

        // 2) مزامنة أولية مع الباكند (اختياري لكنها مفيدة لتوحيد السلوك)
        try {
          console.log("🔄 [DEV] Syncing user data with backend...");
          await syncUserData({
            telegramId: testId,
            telegramUsername: "dev_user",
            fullName: "Dev Tester",
          });
          console.log("✅ [DEV] Sync successful.");
        } catch (e) {
          console.warn("⚠️ [DEV] Sync failed (continuing in dev):", e);
        }

        // 3) فحص حالة الربط isLinked مثل السلوك الحقيقي
        try {
          console.log("🔗 [DEV] Checking link status...");
          const resp = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${encodeURIComponent(
              testId,
            )}`,
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data.linked) {
              console.log("✅ [DEV] User is linked. Gmail:", data.gmail);
              setUserData({ isLinked: true, gmail: data.gmail });
            } else {
              console.log("ℹ️ [DEV] User is NOT linked.");
              setUserData({ isLinked: false, gmail: null });
            }
          } else {
            console.warn(
              "⚠️ [DEV] Link check failed:",
              resp.status,
              resp.statusText,
            );
          }
        } catch (e) {
          console.warn("⚠️ [DEV] Error checking link status:", e);
        }

        if (!isMounted) return;
        setIsTelegramReady(true);
        setIsLoading(false);
        console.log(
          "🚀 [DEV] Ready. App can render Services Hub gated by isLinked.",
        );
      } catch (e) {
        console.error("❌ [DEV] Unexpected boot error:", e);
        if (!isMounted) return;
        setIsTelegramReady(true);
        setIsLoading(false);
      }
    };

    bootDevMode();

    return () => {
      isMounted = false;
      console.log("🧹 TelegramProvider (dev) unmounted. Cleanup complete.");
    };
  }, [setUserData]);

  // إعادة فحص حالة الربط عند العودة للنافذة/التركيز — نفس منطقك الحالي
  useEffect(() => {
    const checkLink = async () => {
      if (!contextTelegramId) return;

      console.log("🔄 [DEV] Re-checking link status on focus/visibility...");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${encodeURIComponent(
            contextTelegramId,
          )}`,
        );
        if (!res.ok) {
          console.warn("⚠️ [DEV] Re-check failed with HTTP error.");
          return;
        }
        const data = await res.json();
        if (data.linked) {
          console.log("✅ [DEV] Link status: linked.");
          setUserData({ isLinked: true, gmail: data.gmail });
        } else {
          console.log("ℹ️ [DEV] Link status: NOT linked.");
          setUserData({ isLinked: false, gmail: null });
        }
      } catch (e) {
        console.error("❌ [DEV] Error re-checking link status:", e);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkLink();
      }
    };

    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", checkLink);

    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", checkLink);
      console.log("🧹 [DEV] Event listeners for focus/visibility removed.");
    };
  }, [contextTelegramId, setUserData]);

  const value: TelegramContextType = {
    isTelegramReady,
    isLoading,
    isTelegramApp: false, // ثابت: هذه نسخة متصفح/اختبار
    telegramId: contextTelegramId,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};
