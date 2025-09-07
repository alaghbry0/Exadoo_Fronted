'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '@/context/TelegramContext';
import { useUserStore } from '@/stores/zustand/userStore';
import { ArrowLeft, Check, X, Zap } from 'lucide-react';
import { useRouter } from 'next/router'; // ✅ جديد

// الإعدادات
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

// خريطة أسماء مختصرة -> مسارات (لتحويل /shop إلى startapp=shop)
const ROUTE_MAP: Record<string, string> = {
  '/shop': 'shop',
  '/plans': 'plans',
  '/profile': 'profile',
  '/notifications': 'notifications',
};

// ✅ م helpers لبناء redirect_url كـ deep link لتليجرام
function buildTelegramDeepLinkForReturn(pathWithQuery: string) {
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;         // مثال: teeeessssstttttttttbot
  const shortName = process.env.NEXT_PUBLIC_MINIAPP_SHORT;  // مثال: exaado_test
  if (!bot || !shortName) return null;

  // لو المسار عنده اسم مختصر معروف (مثلاً /shop → shop)
  const onlyPath = pathWithQuery.split('#')[0]; // تجاهل الهاش
  const [purePath, queryPart] = onlyPath.split('?');
  const short = ROUTE_MAP[purePath];

  let startappParam: string;
  if (short && !queryPart) {
    // بسيط: startapp=shop
    startappParam = short;
  } else {
    // عام: startapp=route:/path?x=y (URL-encoded بعد route:)
    const rawRoute = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
    startappParam = `route:${encodeURIComponent(rawRoute)}`;
  }

  return `https://t.me/${bot}/${shortName}?startapp=${encodeURIComponent(startappParam)}`;
}

const AuthPrompt: React.FC = () => {
  const router = useRouter(); // ✅ جديد
  const { telegramId } = useTelegram();
  const { telegramUsername, isLinked, setLinked, setUserData } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pollTimerRef = useRef<number | null>(null);
  const pollDeadlineRef = useRef<number | null>(null);

  // ----- نفس الدوال القديمة تماماً -----
  const checkLinkStatus = async () => {
    if (!telegramId) return null;
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/linked?telegramId=${encodeURIComponent(telegramId)}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) { return null; }
      const data = await res.json();
      if (typeof setLinked === 'function') {
        setLinked(Boolean(data.linked), data.gmail ?? null);
      } else if (typeof setUserData === 'function') {
        setUserData({ isLinked: Boolean(data.linked), gmail: data.gmail ?? null });
      }
      return data;
    } catch { return null; }
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
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
        setSheetOpen(false);
        return;
      }
      if (Date.now() > (pollDeadlineRef.current ?? 0)) {
        setToast('لم يصل تأكيد الربط بعد.');
        stopPolling();
        return;
      }
      pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS) as unknown as number;
    };
    pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS) as unknown as number;
  };

  // ✅ تعديل handleLink لإرسال redirect_url يودي لنفس الصفحة داخل Mini App
  const handleLink = () => {
    if (!telegramId) {
      setToast('لم نتمكن من الحصول على معرف تيليجرام.');
      return;
    }
    setLoading(true);
    try {
      // 1) حدّد الصفحة الحالية (path + query + hash)
      const currentPath = router.asPath || '/';
      // 2) جرّب بناء deep link يرجّع لتيليجرام
      const telegramReturn = buildTelegramDeepLinkForReturn(currentPath);
      // 3) fallback: لو مافي bot/shortName في env، نرجّع مباشرة لنفس الـ URL
      const fallbackUrl = typeof window !== 'undefined' ? window.location.href : '';
      const redirectUrl = encodeURIComponent(telegramReturn || fallbackUrl);

      const uname = encodeURIComponent(telegramUsername || '');
      const deepLink = `https://app.exaado.com/link_telegram?id=${encodeURIComponent(telegramId)}&uname=${uname}&redirect_url=${redirectUrl}`;

      // فتح صفحة الربط في تبويب جديد
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

  if (isLinked) return null;

  // --- UI كما هو ---
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl p-6 my-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-primary-100 p-3 rounded-full">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">تجربة أفضل مع تطبيق الموبايل!</h3>
              <p className="text-gray-600 mt-1">اربط حسابك للوصول إلى العروض الخاصة وتجربة شراء أسرع.</p>
            </div>
          </div>

          <button
            onClick={() => setSheetOpen(true)}
            className="w-full md:w-auto flex-shrink-0 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1"
          >
            ربط الحساب الآن
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl p-6 shadow-2xl"
              dir="rtl"
            >
              <button
                onClick={() => setSheetOpen(false)}
                className="absolute top-4 left-4 p-1 text-gray-400 hover:text-gray-700"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الوصول الكامل لخدماتنا</h3>
                <p className="text-gray-600 mb-6">قم بربط حسابك مع تطبيقنا الموبايل للاستفادة من جميع الميزات.</p>
                <button
                  onClick={handleLink}
                  disabled={!telegramId || loading}
                  className={`w-full flex items-center justify-center gap-3 shadow-lg rounded-xl px-4 py-3 transform transition-all duration-150 ${
                    telegramId
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:-translate-y-1'
                      : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'جارٍ التحويل...' : 'فتح تطبيق الموبايل للمصادقة'}
                  {!loading && <ArrowLeft className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-[100]"
          >
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span className="text-sm">{toast}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthPrompt;
