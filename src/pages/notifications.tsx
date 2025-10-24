// pages/notifications.tsx (النسخة النهائية والمحسنة)

"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Bell, Check, RefreshCw } from "lucide-react";
import NotificationFilter from "@/features/notifications/components/NotificationFilter";
import { useTelegram } from "../context/TelegramContext";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  animations,
  colors,
  radius,
  shadowClasses,
  spacing,
} from "@/styles/tokens";
// import PageLayout from '@/shared/components/layout/PageLayout' // غير مستخدم;

// استيراد ديناميكي لمكون NotificationItem مع هيكل تحميل محسن
const NotificationItem = dynamic(
  () => import("@/features/notifications/components/NotificationItem"),
  {
    loading: () => <NotificationSkeleton />,
  },
);

// هيكل تحميل محسن للإشعارات
const skeletonContainerStyle: CSSProperties = {
  backgroundColor: colors.bg.elevated,
  borderColor: colors.border.default,
  borderStyle: "solid",
  borderWidth: "1px",
  borderRadius: radius.xl,
  padding: spacing[5],
};

const skeletonLineStyle: CSSProperties = {
  backgroundColor: colors.bg.tertiary,
  borderRadius: radius.md,
  height: "1rem",
  width: "100%",
  opacity: 0.85,
};

const NotificationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0.5, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(shadowClasses.card, animations.presets.pulse)}
    style={skeletonContainerStyle}
  >
    <div
      style={{
        display: "flex",
        gap: spacing[4],
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          ...skeletonLineStyle,
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: radius.full,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: spacing[3],
        }}
      >
        <div style={{ ...skeletonLineStyle, width: "75%", height: "1.25rem" }} />
        <div style={{ ...skeletonLineStyle, opacity: 0.8 }} />
        <div style={{ ...skeletonLineStyle, width: "85%", opacity: 0.75 }} />
      </div>
      <div
        style={{
          ...skeletonLineStyle,
          width: "2rem",
          height: "2rem",
          borderRadius: radius.full,
        }}
      />
    </div>
  </motion.div>
);

// مكون هيكل تحميل للصفحة الأولى
const PageSkeleton = () => (
  <div
    style={{
      margin: "0 auto",
      padding: `${spacing[6]} ${spacing[5]}`,
      display: "flex",
      flexDirection: "column",
      gap: spacing[4],
      maxWidth: "960px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: spacing[3],
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.lg,
      }}
    >
      <div
        className={animations.presets.pulse}
        style={{ ...skeletonLineStyle, width: "6rem", height: "2rem" }}
      />
      <div
        className={animations.presets.pulse}
        style={{ ...skeletonLineStyle, width: "6rem", height: "2rem" }}
      />
    </div>
    {[...Array(5)].map((_, index) => (
      <NotificationSkeleton key={`skeleton-${index}`} />
    ))}
  </div>
);

const pageWrapperStyle: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  backgroundColor: colors.bg.secondary,
  zIndex: 20,
};

const scrollAreaStyle: CSSProperties = {
  maxWidth: "960px",
  margin: "0 auto",
  padding: `${spacing[6]} ${spacing[5]}`,
  height: "100vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: spacing[5],
};

const stickyHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: spacing[4],
  marginBottom: spacing[4],
  position: "sticky",
  top: 0,
  backgroundColor: colors.bg.secondary,
  zIndex: 10,
  paddingBlock: spacing[3],
};

const statusCardStyle: CSSProperties = {
  marginBottom: spacing[5],
  backgroundImage: `linear-gradient(90deg, ${colors.bg.secondary}, ${colors.bg.tertiary})`,
  padding: spacing[5],
  borderRadius: radius.xl,
  border: `1px solid ${colors.border.default}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing[4],
};

const emptyStateStyle: CSSProperties = {
  textAlign: "center",
  padding: spacing[8],
  backgroundColor: colors.bg.elevated,
  borderRadius: radius.xl,
  border: `1px solid ${colors.border.default}`,
  color: colors.text.secondary,
};

const endMessageStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: spacing[3],
  color: colors.text.secondary,
  fontSize: "0.875rem",
  backgroundColor: colors.bg.tertiary,
  padding: `${spacing[3]} ${spacing[4]}`,
  borderRadius: radius.full,
};

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

  // حالة التحميل الأولية
  if (isLoading) {
    return <PageSkeleton />;
  }

  // حالة الخطأ المحسنة
  if (error) {
    return (
      <div
        style={{
          padding: spacing[6],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: colors.bg.secondary,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={shadowClasses.card}
          style={{
            backgroundColor: colors.status.errorBg,
            padding: spacing[6],
            borderRadius: radius.xl,
            color: colors.status.error,
            marginBottom: spacing[5],
            textAlign: "center",
            maxWidth: "28rem",
            width: "100%",
            border: `1px solid ${colors.border.error}`,
          }}
        >
          <AlertCircle
            style={{
              margin: "0 auto",
              height: "3rem",
              width: "3rem",
              marginBottom: spacing[4],
              color: colors.status.error,
            }}
          />
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              marginBottom: spacing[3],
              color: colors.text.primary,
            }}
          >
            حدث خطأ أثناء تحميل الإشعارات
          </h3>
          <p
            style={{
              marginBottom: spacing[4],
              fontSize: "0.875rem",
              color: colors.status.error,
            }}
          >
            تعذر الاتصال بالخادم. حاول مرة أخرى.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className={shadowClasses.button}
            style={{
              backgroundColor: colors.status.error,
              color: colors.text.inverse,
              padding: `${spacing[3]} ${spacing[5]}`,
              borderRadius: radius.lg,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing[3],
            }}
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <AnimatePresence>
        {isFetching && !isFetchingNextPage && !isLoading && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
            }}
          >
            <div
              className={shadowClasses.card}
              style={{
                padding: spacing[3],
                backgroundColor: colors.bg.elevated,
                borderRadius: radius.full,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw
                className={animations.presets.spin}
                style={{
                  height: "1.5rem",
                  width: "1.5rem",
                  color: colors.brand.primary,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} style={scrollAreaStyle}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={stickyHeaderStyle}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className={shadowClasses.button}
            style={{
              backgroundColor: colors.bg.elevated,
              color: colors.text.primary,
              fontWeight: 700,
              padding: spacing[3],
              borderRadius: radius.full,
              border: `1px solid ${colors.border.default}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="العودة للصفحة الرئيسية"
          >
            <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} />
          </motion.button>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              flex: 1,
              textAlign: "center",
              color: colors.text.primary,
            }}
          >
            الإشعارات
          </h1>
          <div style={{ width: "2rem" }} aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={shadowClasses.card}
          style={statusCardStyle}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing[3],
              color: colors.text.secondary,
            }}
          >
            <Bell size={20} style={{ color: colors.brand.primary }} aria-hidden="true" />
            <span style={{ fontWeight: 600, color: colors.text.primary }}>
              لديك {unreadCount} إشعار غير مقروء
            </span>
          </div>
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.brand.primary,
              color: colors.text.inverse,
              borderRadius: radius.full,
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: "0.875rem",
              fontWeight: 600,
              minWidth: "2.5rem",
            }}
          >
            {unreadCount}
          </motion.span>
        </motion.div>

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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing[4],
          }}
        >
          {notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationItem notification={notification} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            !isFetching && (
              <motion.div
                className={shadowClasses.card}
                style={emptyStateStyle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Bell
                  size={64}
                  style={{
                    marginBottom: spacing[4],
                    color: colors.text.tertiary,
                  }}
                />
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  لا توجد إشعارات {filter === "unread" ? "غير مقروءة" : ""}
                </p>
                <p
                  style={{
                    marginTop: spacing[3],
                    fontSize: "0.875rem",
                    maxWidth: "20rem",
                    marginInline: "auto",
                  }}
                >
                  ستظهر الإشعارات الجديدة هنا فور وصولها.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refetch()}
                  className={shadowClasses.button}
                  style={{
                    marginTop: spacing[5],
                    backgroundColor: colors.bg.elevated,
                    color: colors.brand.primary,
                    border: `1px solid ${colors.border.default}`,
                    padding: `${spacing[3]} ${spacing[5]}`,
                    borderRadius: radius.lg,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing[3],
                  }}
                >
                  <RefreshCw size={16} />
                  تحديث
                </motion.button>
              </motion.div>
            )
          )}
        </div>

        {isFetchingNextPage && (
          <motion.div
            style={{
              marginTop: spacing[6],
              display: "flex",
              flexDirection: "column",
              gap: spacing[4],
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <NotificationSkeleton key={`loading-${index}`} />
            ))}
          </motion.div>
        )}

        {!hasNextPage && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              marginTop: spacing[6],
              paddingBottom: spacing[4],
            }}
          >
            <div style={endMessageStyle}>
              <Check size={16} style={{ color: colors.brand.primary }} />
              لقد شاهدت جميع الإشعارات
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
