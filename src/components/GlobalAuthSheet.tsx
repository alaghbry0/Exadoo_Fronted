// src/components/GlobalAuthSheet.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/zustand/userStore';
import { useUIStore } from '@/stores/zustand/uiStore';
import { useRouter } from 'next/router';
import { ArrowLeft, X, ShieldAlert, Zap, Gift, Sparkles } from 'lucide-react';

// ... (الدوال المساعدة مثل buildTelegramDeepLinkForReturn تبقى كما هي)
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;
const ROUTE_MAP: Record<string, string> = {
  '/shop': 'shop',
  '/plans': 'plans',
  '/profile': 'profile',
  '/notifications': 'notifications',
};
function buildTelegramDeepLinkForReturn(pathWithQuery: string) {
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const shortName = process.env.NEXT_PUBLIC_MINIAPP_SHORT;
  if (!bot || !shortName) return null;

  const onlyPath = pathWithQuery.split('#')[0];
  const [purePath, queryPart] = onlyPath.split('?');
  const short = ROUTE_MAP[purePath];

  let startappParam: string;
  if (short && !queryPart) {
    startappParam = short;
  } else {
    const rawRoute = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
    startappParam = `route:${encodeURIComponent(rawRoute)}`;
  }

  return `https://t.me/${bot}/${shortName}?startapp=${encodeURIComponent(startappParam)}`;
}

const GlobalAuthSheet: React.FC = () => {
  // ✅ تم إضافة authContext
  const { isAuthPromptOpen, closeAuthPrompt, authContext } = useUIStore();
  const { isLinked, telegramId, telegramUsername, setLinked } = useUserStore();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // ... (كل منطق الحالة والربط موجود هنا)
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const pollDeadlineRef = useRef<number | null>(null);

  const checkLinkStatus = async () => {
    if (!telegramId) return null;
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${encodeURIComponent(telegramId)}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) { return null; }
      const data = await res.json();
      setLinked(Boolean(data.linked), data.gmail ?? null);
      return data;
    } catch { return null; }
  };

  const stopPolling = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
    setPolling(false);
    pollDeadlineRef.current = null;
  };

  const startShortPolling = () => {
    if (polling) return;
    setPolling(true);
    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
    const tick = async () => {
      const data = await checkLinkStatus();
      if (data && data.linked) {
        setToast('تم الربط بنجاح 🎉');
        stopPolling();
        closeAuthPrompt();
        return;
      }
      if (Date.now() > (pollDeadlineRef.current ?? 0)) {
        setToast('لم يصل تأكيد الربط بعد.');
        stopPolling();
        return;
      }
      pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
    };
    pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
  };

function safeEncodeOnce(raw: string) {
  try {
    // لو شكله مشفّر مسبقًا، نفكّه مرة
    const decoded = decodeURIComponent(raw);
    // لو الفك نجح بدون تغيّر جذري، اشتغل على المفكوك
    return encodeURIComponent(decoded);
  } catch {
    // لو كان غير قابل للفك، شفّره مباشرة
    return encodeURIComponent(raw);
  }
}

  const handleLink = () => {
  if (!telegramId) {
    setToast('لم نتمكن من الحصول على معرف تيليجرام.');
    return;
  }
  setLoading(true);
  try {
    const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;
    // 👇 استخدم رابط خام غير مشفّر
    const botOpenUrl = bot ? `https://t.me/${bot}` : null;

    const currentPath = router.asPath || '/';
    const telegramReturn = buildTelegramDeepLinkForReturn(currentPath);
    const fallbackUrl = typeof window !== 'undefined' ? window.location.href : '';

    // اختر الهدف: فتح البوت مباشرة، ثم ديب لينك، ثم رابط الصفحة
    const redirectTarget = botOpenUrl || telegramReturn || fallbackUrl;

    // 👇 شفّر مرة واحدة فقط
    const redirectUrl = safeEncodeOnce(redirectTarget);

    const uname = encodeURIComponent(telegramUsername || '');
    const deepLink = `https://app.exaado.com/link_telegram?id=${encodeURIComponent(
      telegramId
    )}&uname=${uname}&redirect_url=${redirectUrl}`;

    window.open(deepLink, '_blank', 'noopener,noreferrer');
    setTimeout(startShortPolling, 2000);
  } catch {
    setToast('حدث خطأ أثناء إنشاء الرابط.');
  } finally {
    setTimeout(() => setLoading(false), 1000);
  }
};
  useEffect(() => { return () => stopPolling(); }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // مميزات العرض العام (تُعرض فقط عندما ليس Locked)
  const features = [
    { icon: Zap, text: 'وصول فوري لجميع الخدمات' },
    { icon: Gift, text: 'عروض وخصومات حصرية' },
    { icon: Sparkles, text: 'تجربة استخدام متكاملة وسلسة' },
  ];

  // إذا لم نكن في المتصفح، أو كانت النافذة غير مفتوحة، أو المستخدم مرتبط، لا تعرض شيئاً
  if (!isClient || !isAuthPromptOpen || isLinked) {
    return null;
  }

  // ✅ تحديد وضع الرسائل حسب السياق
  const isLockedContext = authContext === 'locked';

  return createPortal(
    <AnimatePresence>
      {/* الخلفية */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthPrompt}
        className="fixed inset-0 bg-black/60 z-[100]"
        aria-hidden="true"
      />
      {/* الشيت */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-neutral-900 rounded-t-3xl p-6 pb-8 shadow-2xl max-w-lg mx-auto"
        dir="rtl"
        role="dialog"
      >
        <button
          onClick={closeAuthPrompt}
          className="absolute top-4 left-4 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* ✅ محتوى متبدّل حسب السياق */}
          {isLockedContext ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-4 border-4 border-white dark:border-neutral-800">
                <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                يتطلب ربط الحساب
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                للوصول لهذه الميزة، يجب مزامنة حسابك مع تطبيق الموبايل.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 mb-4 border-4 border-white dark:border-neutral-800">
                <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                تجربة أفضل مع تطبيق الموبايل!
              </h3>
              <p className="text-gray-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                اربط حسابك للوصول إلى العروض الخاصة وتجربة شراء أسرع.
              </p>
            </>
          )}
          {!isLockedContext && (
            <div className="space-y-3 text-right mb-8 max-w-xs mx-auto mt-6">
              {features.map(({ icon: Icon, text }, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                    <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* ✅ زر بنفس الـ classes مع نص متغيّر */}
          <button
            onClick={handleLink}
            disabled={!telegramId || loading}
            className={`w-full flex items-center justify-center gap-3 shadow-lg rounded-xl px-4 py-3.5 transform transition-all duration-300 font-bold ${
              telegramId
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:-translate-y-1'
                : 'bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-500'
            }`}
          >
            {loading
              ? 'جارٍ التحويل...'
              : (isLockedContext ? 'ربط الحساب والمتابعة' : 'ربط الحساب الآن')}
            {!loading && <ArrowLeft className="w-5 h-5" />}
          </button>

          {/* ✅ عرض المزايا فقط في الوضع العام */}
          

          {polling && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-gray-500 dark:text-neutral-400"
            >
              في انتظار تأكيد الربط...
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Toast لا يزال هنا */}
      {/* يمكنك إبقاء مكوّن التوست الحالي كما هو */}
    </AnimatePresence>,
    document.body
  );
};

export default GlobalAuthSheet;
