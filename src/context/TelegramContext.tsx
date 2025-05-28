'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "../stores/zustand/userStore";

interface TelegramContextType {
  isTelegramReady: boolean; // هل بيانات تيليجرام الأساسية (مثل ID) جاهزة؟
  isLoading: boolean;       // هل السياق لا يزال في مرحلة التحميل/الانتظار؟
  isTelegramApp: boolean;   // هل يتم تشغيل التطبيق داخل Telegram Web App؟
  telegramId: string | null; // معرف تيليجرام للمستخدم (من Zustand)
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegramReady: false,
  isLoading: true,        // يبدأ التحميل افتراضيًا
  isTelegramApp: false,
  telegramId: null,
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  // استخدام Zustand store لإدارة بيانات المستخدم وتمريرها للسياق
  const { setUserData, telegramId: contextTelegramId } = useUserStore();

  // حالات محلية لإدارة حالة السياق
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  // استخدام Refs لتجنب إعادة إنشاء الدوال أو الاعتماد عليها في useEffects بشكل غير ضروري
  const isTelegramAppRef = useRef(false); // لتخزين حالة isTelegramApp بشكل يمكن الوصول إليه داخل Callbacks
  const retryTimeoutRef = useRef<number | null>(null); // لتخزين مؤقت إعادة المحاولة
  const fetchTelegramUserDataRef = useRef<() => void>(() => {}); // لتخزين أحدث نسخة من دالة الجلب

  // useCallback لمسح مؤقت إعادة المحاولة بأمان
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      console.log("🧹 Clearing pending retry timeout...");
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []); // لا يعتمد على أي شيء

  // useCallback لجدولة إعادة محاولة جلب البيانات
  const retryInitDataFetch = useCallback(() => {
    clearRetryTimeout(); // مسح أي محاولة سابقة قبل جدولة واحدة جديدة
    console.log("⏳ Scheduling retry fetch in 1 second...");
    // استخدام window.setTimeout لتجنب مشاكل النوع مع NodeJS.Timeout
    retryTimeoutRef.current = window.setTimeout(() => {
      console.log("🔄 Executing scheduled retry fetch...");
      // استدعاء الدالة الأحدث المحفوظة في الـ ref
      fetchTelegramUserDataRef.current();
    }, 1000); // إعادة المحاولة بعد ثانية واحدة
  }, [clearRetryTimeout]); // يعتمد فقط على clearRetryTimeout (وهو ثابت)

  // useCallback لدالة جلب بيانات المستخدم الرئيسية
  const fetchTelegramUserData = useCallback(() => {
    console.log("🚀 Attempting to fetch Telegram User Data...");

    // استخدام الـ ref للحصول على أحدث قيمة لـ isTelegramApp
    if (!isTelegramAppRef.current) {
      console.log("🚫 Not running inside Telegram WebApp (checked in fetch). Setting loading to false.");
      setIsLoading(false); // إيقاف التحميل إذا لم نكن في تيليجرام
      clearRetryTimeout(); // مسح أي مؤقت إعادة محاولة غير ضروري
      return; // الخروج من الدالة
    }

    // الوصول إلى كائن Telegram WebApp
    const tg = window.Telegram?.WebApp;
    console.log("🔍 Telegram WebApp instance:", tg);

    if (!tg) {
      console.warn("⚠️ Telegram WebApp SDK (window.Telegram.WebApp) not found. Setting loading to false.");
      setIsLoading(false); // إيقاف التحميل إذا كان الكائن غير متاح
      clearRetryTimeout();
      return;
    }

    // استدعاء tg.ready() لضمان جاهزية الـ SDK (آمن للاستدعاء المتكرر)
    tg.ready();
    // توسيع نافذة التطبيق (اختياري، آمن للاستدعاء المتكرر)
    tg.expand();

    console.log("🔐 Checking tg.initDataUnsafe for user data...");
    // التحقق من وجود initDataUnsafe وبيانات المستخدم والمعرف
    if (tg.initDataUnsafe?.user?.id) {
      const user = tg.initDataUnsafe.user;
      const userData = {
        telegramId: user.id.toString(), // تأكد من أنه سلسلة نصية
        telegramUsername: user.username || null,
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
        photoUrl: user.photo_url || null,
        joinDate: null, // يمكن تعيينه لاحقًا إذا لزم الأمر
      };

      console.log("✅ Telegram User Data Fetched Successfully:", userData);

      setUserData(userData);       // تحديث بيانات المستخدم في Zustand
      setIsTelegramReady(true);    // تحديد أن بيانات تيليجرام الأساسية جاهزة
      setIsLoading(false);         // تحديد أن التحميل الأولي للسياق انتهى
      clearRetryTimeout();         // مسح أي مؤقت إعادة محاولة قائم

    } else {
      // إذا لم تكن البيانات متاحة بعد (شائع عند التحميل الأول)
      console.warn("⏳ Telegram initDataUnsafe.user or user.id is missing. Scheduling retry.");
      // تسجيل البيانات المتاحة للمساعدة في التصحيح
      console.log("ℹ️ Current initDataUnsafe:", JSON.stringify(tg.initDataUnsafe));
      // جدولة إعادة المحاولة
      retryInitDataFetch();
    }
  // يعتمد useCallback على الدوال المستقرة (setUserData, clearRetryTimeout, retryInitDataFetch)
  // State setters (setIsLoading, setIsTelegramReady) مستقرة ولا تحتاج للإدراج
  }, [setUserData, clearRetryTimeout, retryInitDataFetch]);

  // useEffect لتحديث الـ ref دائمًا بأحدث نسخة من fetchTelegramUserData
  // هذا مفيد لضمان أن Callbacks الأخرى (مثل retry) تستدعي النسخة الصحيحة
  useEffect(() => {
    fetchTelegramUserDataRef.current = fetchTelegramUserData;
  }, [fetchTelegramUserData]);

  // --- ✅ التعديل: useEffect للتحميل الأولي بدون setTimeout ---
  // هذا الـ Effect يعمل مرة واحدة عند تحميل المكون (بسبب [])
  useEffect(() => {
    console.log("🚀 TelegramProvider mounted. Running initial setup...");

    // --- إزالة غلاف setTimeout ---
    // التحقق الفوري مما إذا كنا نعمل داخل تطبيق ويب تيليجرام
    const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
    setIsTelegramApp(isClientSideTelegramApp);
    isTelegramAppRef.current = isClientSideTelegramApp; // تحديث الـ ref فوراً
    console.log("🔍 Initial Detection - Is Telegram WebApp:", isClientSideTelegramApp);

    // استدعاء دالة الجلب مباشرة عبر الـ ref
    fetchTelegramUserDataRef.current();
    // --- نهاية إزالة setTimeout ---

    // دالة التنظيف: يتم استدعاؤها عند إلغاء تحميل المكون
    return () => {
      console.log("🧹 TelegramProvider unmounted. Clearing any pending retry timeout.");
      // التأكد من مسح أي مؤقت إعادة محاولة عند الخروج
      clearRetryTimeout();
    };
  // يعتمد هذا الـ Effect على clearRetryTimeout لأنه يُستخدم في دالة التنظيف.
  // لا نحتاج لإضافة fetchTelegramUserData كاعتمادية لأننا نستدعيه عبر الـ ref،
  // مما يضمن أن الـ Effect لا يُعاد تشغيله فقط بسبب تغير مرجع الدالة.
  // استخدام [] كان سيعمل أيضًا، لكن إضافة clearRetryTimeout أفضل للممارسات.
  }, [clearRetryTimeout]);
  // --- نهاية التعديل ---

  // تجميع قيمة السياق لتمريرها للـ Provider
  const value: TelegramContextType = {
    isTelegramReady,
    isLoading,
    isTelegramApp,
    telegramId: contextTelegramId, // الحصول على ID المحدث من Zustand
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

// Hook مخصص لاستخدام السياق بسهولة وأمان
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  // التأكد من أن الـ Hook يُستخدم داخل Provider
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};