// TelegramContext.tsx (النسخة النهائية المدمجة مع تحديث الحالة عند التركيز)
'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserStore } from "@/shared/state/zustand/userStore";
// ملاحظة: قم بتعديل المسار التالي ليشير إلى ملف الخدمات الذي يحتوي على دالة syncUserData
import { syncUserData } from "@/shared/api/userSync";

// Define types for Telegram Web App objects to avoid using 'any'
interface TGUser {
  id: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

interface TGWebApp {
  ready: () => void;
  expand: () => void;
  initDataUnsafe: {
    user?: TGUser;
  };
}

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

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUserData, telegramId: contextTelegramId } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // useEffect الأول: لتهيئة SDK والمزامنة الأولية
  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log("🚫 Running on server, skipping Telegram SDK initialization.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initializeTelegram = async () => {
      console.log("🚀 Starting Telegram initialization process...");
      const MAX_ATTEMPTS = 10;
      const RETRY_DELAY_MS = 300;
      let tg: TGWebApp | undefined;

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (window.Telegram?.WebApp) {
          tg = window.Telegram.WebApp as unknown as TGWebApp;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      if (!tg) {
        if (isMounted) {
          console.error("❌ Telegram SDK not found. Assuming not in Telegram environment.");
          setIsTelegramApp(false);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        console.log("✅ Telegram WebApp SDK found!");
        setIsTelegramApp(true);
        tg.ready();
      }

      let user: TGUser | undefined;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (tg.initDataUnsafe?.user?.id) {
            user = tg.initDataUnsafe.user;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      if (!user) {
        if (isMounted) {
            console.error("❌ Failed to get user data from Telegram SDK.");
            setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        console.log("✅ Telegram User Data Fetched Successfully:", user);

        setUserData({
          telegramId: user.id.toString(),
          telegramUsername: user.username || null,
          fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
          photoUrl: user.photo_url || null,
          joinDate: null,
        });

        try {
          console.log("🔄 Syncing user data with backend...");
          await syncUserData({
            telegramId: user.id.toString(),
            telegramUsername: user.username || null,
            fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null
          });
          console.log("✅ Sync successful.");

          console.log("🔗 Checking user link status (initial check)...");
          const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${user.id}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data.linked) {
              console.log("✅ User is linked. Gmail:", data.gmail);
              setUserData({ isLinked: true, gmail: data.gmail });
            } else {
              console.log("ℹ️ User is not linked.");
              setUserData({ isLinked: false, gmail: null });
            }
          } else {
            console.warn("⚠️ Failed to check link status. Response:", resp.statusText);
          }
        } catch (err) {
          console.error("❌ Error during post-init sync/check:", err);
        }

        setIsTelegramReady(true);
        setIsLoading(false);
        tg.expand();
      }
    };

    initializeTelegram();

    return () => {
      isMounted = false;
      console.log("🧹 TelegramProvider (init) unmounted. Cleanup complete.");
    };
  }, [setUserData]);


  // ======================================================
  // بداية الكود الجديد الذي تم إضافته
  // useEffect الثاني: للتحقق من حالة الربط عند عودة المستخدم للتطبيق
  // ======================================================
  useEffect(() => {
    const checkLink = async () => {
      // لا تقم بتنفيذ أي شيء إذا لم يكن هناك معرف تيليجرام بعد
      if (!contextTelegramId) return;

      console.log('🔄 Re-checking link status on focus/visibility change...');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${contextTelegramId}`);
        if (!res.ok) {
          console.warn('⚠️ Re-check failed, server responded with error.');
          return;
        }
        const data = await res.json();
        if (data.linked) {
          console.log('✅ Link status re-checked: User is linked.');
          setUserData({ isLinked: true, gmail: data.gmail });
        } else {
          console.log('ℹ️ Link status re-checked: User is NOT linked.');
          setUserData({ isLinked: false, gmail: null });
        }
      } catch (e) {
        console.error('❌ Error re-checking link status:', e);
      }
    };

    // دالة للتحقق عند تغيير حالة الظهور
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkLink();
      }
    };

    // إضافة المستمعين للأحداث
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', checkLink);

    // دالة التنظيف لإزالة المستمعين عند إلغاء تحميل المكون
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', checkLink);
      console.log("🧹 Event listeners for focus/visibility removed.");
    };
  }, [contextTelegramId, setUserData]); // يعتمد على معرف تيليجرام ودالة تحديث الحالة
  // ======================================================
  // نهاية الكود الجديد
  // ======================================================

  const value: TelegramContextType = {
    isTelegramReady,
    isLoading,
    isTelegramApp,
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

