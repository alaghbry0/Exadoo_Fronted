// pages/notifications.tsx (النسخة النهائية والمحسنة)

"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Bell, Check, RefreshCw } from "lucide-react";
import NotificationFilter from "@/features/notifications/components/NotificationFilter";
import { useTelegram } from "../context/TelegramContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { useNotifications } from "@/hooks/useNotifications";
// import PageLayout from '@/shared/components/layout/PageLayout' // غير مستخدم;

// استيراد ديناميكي لمكون NotificationItem مع هيكل تحميل محسن
const NotificationItem = dynamic(
  () => import("@/features/notifications/components/NotificationItem"),
  {
    loading: () => <NotificationSkeleton />,
  },
);

// هيكل تحميل محسن للإشعارات
const NotificationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.5, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
  >
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
    </div>
  </motion.div>
);

// مكون هيكل تحميل للصفحة الأولى
const PageSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-4">
    <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
      <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
    </div>
    {[...Array(5)].map((_, i) => (
      <NotificationSkeleton key={`skeleton-${i}`} />
    ))}
  </div>
);

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = (searchParams.get("filter") || "all") as "all" | "unread";
  const { telegramId } = useTelegram();

  // ✨ استخدام السياق والـ hook المبسطين
  const { unreadCount, markAllAsRead } = useNotificationsContext();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching, // ✨ استخدام isFetching لتتبع أي جلب للبيانات (أولي أو تحديث)
    isFetchingNextPage,
    isLoading, // للتحميل الأولي فقط
    error,
    refetch,
  } = useNotifications(telegramId, filter);

  // ❌ تم إزالة كل الحالات المتعلقة بالسحب للتحديث (isRefreshing, refreshProgress, startY)

  const scrollRef = useRef<HTMLDivElement>(null);
  const notifications = data?.pages.flat() || [];

  // تلقائي تحميل المزيد عند الوصول إلى نهاية الصفحة
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (
          scrollHeight - scrollTop - clientHeight < 200 &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      }
    };
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleGoBack = () => {
    router.push("/");
  };

  const themeColors = {
    primary: "blue",
    accent: "indigo",
    background: "gray-50",
  };

  // حالة التحميل الأولية
  if (isLoading) {
    return <PageSkeleton />;
  }

  // حالة الخطأ المحسنة
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-50 p-6 rounded-xl text-red-600 mb-6 text-center max-w-md w-full border border-red-100 shadow-sm"
        >
          <AlertCircle className="mx-auto h-12 w-12 mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2">
            حدث خطأ أثناء تحميل الإشعارات
          </h3>
          <p className="mb-4 text-sm text-red-500">
            تعذر الاتصال بالخادم. حاول مرة أخرى.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-red-600 transition-colors w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-${themeColors.background} z-20`}>
      {/* ✨ مؤشر تحديث مبسط يعتمد على isFetching */}
      <AnimatePresence>
        {isFetching && !isFetchingNextPage && !isLoading && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="p-2 bg-white rounded-full shadow-lg">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="container mx-auto px-4 py-6 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
      >
        {/* رأس الصفحة مع زر الرجوع */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center mb-4 sticky top-0 bg-${themeColors.background} z-10 py-3`}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold p-3 rounded-full shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold flex-1 text-center text-gray-800">
            الإشعارات
          </h1>
          <div className="w-8"></div>
        </motion.div>

        {/* شريط حالة الإشعارات غير المقروءة */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`mb-5 bg-gradient-to-r from-${themeColors.primary}-50 to-${themeColors.accent}-50 p-4 rounded-xl shadow-sm border border-${themeColors.primary}-100 flex items-center justify-between`}
        >
          <div className="flex items-center">
            <Bell
              size={20}
              className={`text-${themeColors.primary}-500 mr-2`}
            />
            <span className="font-semibold text-gray-700">
              الإشعارات غير المقروءة:
            </span>
          </div>
          <motion.span
            key={unreadCount}
            className={`inline-flex items-center justify-center bg-${themeColors.primary}-500 text-white rounded-full px-3 py-1 text-sm font-medium`}
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {unreadCount}
          </motion.span>
        </motion.div>

        {/* مكون التصفية */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NotificationFilter
            currentFilter={filter}
            unreadCount={unreadCount}
            onMarkAllAsRead={markAllAsRead}
          />
        </motion.div>

        {/* قائمة الإشعارات أو رسالة الحالة الفارغة */}
        <div className="mt-4 space-y-3">
          {notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </AnimatePresence>
          ) : (
            !isFetching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 mt-6 text-gray-500 bg-white rounded-xl shadow-sm border"
              >
                <Bell size={80} className="text-gray-400 mb-6" />
                <p className="text-lg font-medium">
                  لا توجد إشعارات {filter === "unread" ? "غير مقروءة" : ""}
                </p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs text-center">
                  ستظهر الإشعارات الجديدة هنا فور وصولها.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  className={`mt-6 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2`}
                >
                  <RefreshCw size={16} />
                  تحديث
                </motion.button>
              </motion.div>
            )
          )}
        </div>

        {/* مؤشر تحميل المزيد */}
        {isFetchingNextPage && (
          <motion.div
            className="my-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <NotificationSkeleton key={`loading-${i}`} />
            ))}
          </motion.div>
        )}

        {/* رسالة نهاية القائمة */}
        {!hasNextPage && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center my-6 pb-4"
          >
            <div className="inline-flex items-center text-gray-400 text-sm bg-gray-100 px-4 py-2 rounded-full">
              <Check size={16} className="mr-2" />
              لقد شاهدت جميع الإشعارات
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
