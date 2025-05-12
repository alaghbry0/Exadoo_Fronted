'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import type { AppProps } from 'next/app'

// ChatWidget type is already defined in telegram-web-app.d.ts
import { useRouter } from 'next/router'
import '../styles/globals.css'
import FooterNav from '../components/FooterNav'
import SplashScreen from '../components/SplashScreen'
import { TelegramProvider, useTelegram } from '../context/TelegramContext' // تم التأكد من الاستيراد
import { useTariffStore } from '../stores/zustand'
import { fetchBotWalletAddress } from '../services/api'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query'
import { useProfileStore } from '../stores/profileStore'
import { NotificationToast } from '../components/NotificationToast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useNotificationsSocket, NotificationMessage as SocketNotificationMessage } from '@/hooks/useNotificationsSocket'
import { NotificationsProvider, useNotificationsContext } from '@/context/NotificationsContext'
import { showToast } from '@/components/ui/Toast'

export interface NotificationExtraData {
  invite_link?: string | null;
  subscription_type?: string;
  subscription_history_id?: number;
  expiry_date?: string;
  start_date?: string;
  payment_token?: string;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read_status: boolean;
  extra_data?: NotificationExtraData;
}

const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      gcTime: 10 * 60 * 1000 // 10 minutes
    }
  }
})

// Hook مخصص لجلب عنوان المحفظة مع استخدام React Query
const useWalletAddress = () => {
  return useQuery({
    queryKey: ['walletAddress'],
    queryFn: fetchBotWalletAddress,
    retry: 3, // إعادة المحاولة 3 مرات في حالة الفشل
    staleTime: 15 * 60 * 1000, // اعتبار البيانات قديمة بعد 15 دقيقة
  });
}

// المكون الذي يحتوي على منطق التطبيق الرئيسي وشاشة البداية
function AppContent({ children }: { children: React.ReactNode }) {
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);
  const { setSubscriptions } = useProfileStore();

  // --- ✅ التعديل: استخدام سياق تيليجرام ---
  const tgContext = useTelegram();
  // يمكنك الاستمرار في استخدام telegramId مباشرة من tgContext إذا أردت
  const { telegramId, isLoading: isTelegramLoading, isTelegramReady, isTelegramApp } = tgContext;
  // ----------------------------------------

  const { setWalletAddress } = useTariffStore();
  const { setUnreadCount } = useNotificationsContext();
  const router = useRouter();
  const queryClient = useTanstackQueryClient();
  const handleWebSocketMessageRef = useRef<((message: SocketNotificationMessage) => void) | null>(null);

  // useEffect لمعالجة رسائل WebSocket
  useEffect(() => {
    handleWebSocketMessageRef.current = (message: SocketNotificationMessage) => {
      console.log("📩 WebSocket message received in _app.tsx:", message);

      // تحديث عدد الإشعارات غير المقروءة
      if (message.type === "unread_update") {
        const data = message.data as { count?: number };
        if (data?.count !== undefined) {
          console.log(`🔄 Updating unread count via Context to: ${data.count}`);
          setUnreadCount(data.count);
        }
        return;
      }

      // معالجة إشعار جديد
      if (message.type === "new_notification") {
        const notificationData = message.data as NotificationData;
        console.log("✨ New notification received in _app.tsx:", notificationData);

        // إلغاء صلاحية استعلام الإشعارات لإعادة الجلب
        if (telegramId) {
          console.log(`🔄 Invalidating notifications for telegramId: ${telegramId} due to new_notification`);
          // استخدام queryClient.invalidateQueries لتحديث البيانات من الخادم
          queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
        } else {
          console.warn("⚠️ telegramId is null when receiving new_notification. Cannot invalidate notification queries.");
        }

        // معالجة خاصة لإشعارات تجديد الاشتراك
        if (notificationData.type === 'subscription_renewal' && notificationData.extra_data) {
          const expiryDate = notificationData.extra_data.expiry_date
            ? new Date(notificationData.extra_data.expiry_date)
            : null;
          const formattedDate = expiryDate ? expiryDate.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'تاريخ غير محدد';
          const toastMessage = `✅ تم تجديد اشتراكك في ${notificationData.extra_data.subscription_type || 'الخدمة'} حتى ${formattedDate} UTC+3`;
          const inviteLink = notificationData.extra_data.invite_link;

          const toastOnClick = () => {
            router.push(`/notifications/${notificationData.id}`);
            // إعادة جلب الإشعارات عند النقر إذا كانت غير مقروءة
            if (!notificationData.read_status && telegramId) {
              queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
            }
          };

          // إظهار التوست مع أو بدون زر الانضمام للقناة
          showToast.success({
            message: toastMessage,
            action: inviteLink ? {
              text: 'انضم إلى القناة',
              onClick: () => window.open(inviteLink, '_blank')
            } : undefined,
            onClick: toastOnClick
          });

          // إلغاء صلاحية استعلام الاشتراكات لتحديثها
          if (telegramId) {
            console.log(`🔄 Invalidating subscriptions for telegramId: ${telegramId} due to subscription_renewal`);
            queryClient.invalidateQueries({ queryKey: ['subscriptions', telegramId] });
          } else {
            console.warn("⚠️ telegramId is null when receiving subscription_renewal. Cannot invalidate subscription queries.");
          }
        } else {
          // يمكنك إظهار توست عام للإشعارات الأخرى إذا أردت
           showToast.success({
               message: `📬 إشعار جديد: ${notificationData.title}`,
               onClick: () => router.push(`/notifications/${notificationData.id}`)
           });
        }
      }

      // معالجة رسالة قراءة إشعار
      if (message.type === "notification_read") {
        console.log("📖 Notification read message received in _app.tsx:", message.data);
        if (telegramId) {
          console.log(`🔄 Invalidating notifications and unread count for telegramId: ${telegramId} due to notification_read`);
          // تحديث قائمة الإشعارات وعدد غير المقروء
          queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
        } else {
          console.warn("⚠️ telegramId is null when receiving notification_read. Cannot invalidate queries.");
        }
      }
    };
    // Dependencies: setUnreadCount, telegramId (للتحقق منه), queryClient (للإلغاء), router (للتوجيه)
  }, [setUnreadCount, telegramId, queryClient, router]);

  // Callback مستقر لتمريره إلى hook الـ WebSocket
  const stableWebSocketMessageHandler = useCallback((message: SocketNotificationMessage) => {
    if (handleWebSocketMessageRef.current) {
      handleWebSocketMessageRef.current(message);
    }
  }, []); // لا يعتمد على أي شيء يتغير

  // Hook لإدارة اتصال WebSocket للإشعارات
  const { connectionState } = useNotificationsSocket(
    telegramId, // تمرير telegramId (قد يكون null في البداية)
    stableWebSocketMessageHandler
  );

  // useEffect لمراقبة حالة اتصال WebSocket
  useEffect(() => {
    // لا تطبع حالة "Disconnected" إذا لم يكن لدينا telegramId بعد
    if (!telegramId && connectionState === 'disconnected') {
      console.log("⚪ WebSocket disconnected (waiting for telegramId).");
      return;
    }
    const statusMap = {
      'connected': "🟢 Connected to notification service (_app.tsx)",
      'connecting': "🟠 Connecting to notification service… (_app.tsx)",
      'disconnected': "🔴 Disconnected from notification service (_app.tsx)"
    };
    console.log(statusMap[connectionState] || `⚪ Unknown connection state: ${connectionState} (_app.tsx)`);
  }, [connectionState, telegramId]); // يعتمد على حالة الاتصال و telegramId

  // useEffect لتحديد اكتمال الحد الأدنى لوقت عرض شاشة البداية
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayCompleted(true);
      console.log("⏱️ Minimum splash delay completed.");
    }, 1500); // 1.5 ثانية
    return () => clearTimeout(timer); // تنظيف المؤقت عند إلغاء تحميل المكون
  }, []); // يعمل مرة واحدة عند التحميل

  // جلب عنوان المحفظة باستخدام Hook المخصص
  const {
    data: walletAddress,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError
  } = useWalletAddress();

  // useEffect لتحديث عنوان المحفظة في Zustand store عند جلبه بنجاح
  useEffect(() => {
    if (walletAddress) {
        console.log("🏦 Wallet address fetched:", walletAddress);
        setWalletAddress(walletAddress);
    }
  }, [walletAddress, setWalletAddress]); // يعتمد على walletAddress و setWalletAddress

  // --- ℹ️ ملاحظة حول جلب الاشتراكات ---
  // الكود الحالي يستخدم localStorage كـ cache ويعيد الجلب كل 5 دقائق.
  // قد يكون من الأفضل استخدام React Query لإدارة هذا الجلب والتخزين المؤقت.
  // مثال باستخدام React Query (إذا أردت استبدال الكود الحالي):
  /*
  const { data: subscriptionsData } = useQuery({
      queryKey: ['subscriptions', telegramId],
      queryFn: async () => {
          if (!telegramId) return null; // لا تجلب إذا لم يكن هناك ID
          // استبدل هذا بدالة الجلب الفعلية من API
          const response = await fetch(`/api/user/${telegramId}/subscriptions`);
          if (!response.ok) throw new Error('Failed to fetch subscriptions');
          return response.json();
      },
      enabled: !!telegramId && (!isTelegramApp || isTelegramReady), // ✅ تفعيل فقط عند توفر الشروط
      staleTime: 5 * 60 * 1000, // 5 دقائق
      gcTime: 10 * 60 * 1000, // 10 دقائق
  });

  useEffect(() => {
      if (subscriptionsData) {
          console.log("📦 Subscriptions loaded via React Query:", subscriptionsData);
          setSubscriptions(subscriptionsData);
      }
  }, [subscriptionsData, setSubscriptions]);
  */
 // الكود الحالي لجلب الاشتراكات (للحفاظ عليه كما هو الآن):
 useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!telegramId) {
        // console.log("Skipping subscription fetch: telegramId is null.");
        return;
      }
      // console.log("Attempting to fetch/load subscriptions for:", telegramId);
      try {
        // محاولة قراءة البيانات المخزنة مؤقتًا
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // استخدام البيانات المؤقتة إذا كانت لا تزال صالحة (أقل من 5 دقائق)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log("📦 Using cached subscriptions for:", telegramId);
            setSubscriptions(data);
            return; // الخروج إذا استخدمنا الكاش
          } else {
            console.log("🗑️ Cached subscriptions expired for:", telegramId);
          }
        }
        // إذا لم يكن هناك كاش صالح، قم بالجلب (الكود الفعلي للجلب غير موجود هنا، افترض أنه يتم)
        // console.log("📞 Fetching subscriptions from source for:", telegramId);
        // const fetchedData = await yourApiFetchSubscriptions(telegramId); // استبدل بالدالة الفعلية
        // localStorage.setItem(`subscriptions_${telegramId}`, JSON.stringify({ data: fetchedData, timestamp: Date.now() }));
        // setSubscriptions(fetchedData);

      } catch (error) {
        console.error(`❌ Failed to fetch/load subscriptions for ${telegramId}:`, error);
      }
    };

    // جلب فوري عند توفر telegramId أو تغيره
    fetchSubscriptions();

    // إعادة الجلب الدوري كل 5 دقائق
    const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000);

    // تنظيف الـ Interval عند إلغاء تحميل المكون أو تغير telegramId
    return () => clearInterval(interval);
  }, [telegramId, setSubscriptions]); // يعتمد على telegramId و setSubscriptions

  // useEffect لجلب الصفحات الهامة مسبقًا لتحسين الأداء
  useEffect(() => {
    const prefetchPages = async () => {
      try {
        const pagesToPrefetch = ['/', '/plans', '/profile', '/notifications'];
        await Promise.all(pagesToPrefetch.map(page => router.prefetch(page)));
        console.log("🔄 Prefetched important pages:", pagesToPrefetch.join(', '));
      } catch (error) {
        console.error('⚠️ Error during page prefetch:', error);
      }
    };
    // تنفيذ الجلب المسبق مرة واحدة
    prefetchPages();
  }, [router]); // يعتمد على router

  // useEffect لتحميل وإعداد Chat Widget
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://alaghbry0.github.io/chat-widget/widget.min.js";
    script.async = true;
    document.body.appendChild(script);
    console.log("💬 Loading Chat Widget script...");

    script.onload = () => {
      console.log("💬 Chat Widget script loaded.");
      if (window.ChatWidget && typeof window.ChatWidget.init === 'function') {
        console.log("💬 Initializing Chat Widget...");
        window.ChatWidget.init({
          projectId: "Exaado mini app",
          apiUrl: "https://exadoo-rxr9.onrender.com/bot/chat/stream",
          theme: "light", // أو 'dark'
          position: "bottom-right",
          direction: "rtl" // أو 'ltr'
        });
      } else {
        console.warn("⚠️ Chat Widget script loaded, but window.ChatWidget.init is not available.");
      }
    };

    script.onerror = () => {
        console.error("❌ Failed to load Chat Widget script.");
    };

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      console.log("🧼 Cleaning up Chat Widget script...");
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // تم إزالة التحقق من وجود window.ChatWidget.destroy لأن الدالة غير موجودة
       // حذف الـ Widget من window لمنع تكرار التهيئة عند التنقل السريع في Next.js (HMR)
       delete window.ChatWidget;
    };
  }, []); // يعمل مرة واحدة عند التحميل

  // --- ✅ التعديل: إعادة تعريف شرط إظهار شاشة البداية ---
  // يجب الانتظار حتى:
  // 1. ينتهي التأخير الأدنى (minDelayCompleted).
  // 2. ينتهي تحميل المحفظة (!isWalletLoading).
  // 3. ينتهي تحميل بيانات تيليجرام الأساسي (!isTelegramLoading).
  // 4. *إذا* كنا داخل تطبيق تيليجرام (isTelegramApp), يجب أن تكون بيانات تيليجرام جاهزة (isTelegramReady).
  const showSplashScreen =
    !minDelayCompleted ||              // انتظر التأخير الأدنى
    isWalletLoading ||                 // انتظر تحميل المحفظة
    isTelegramLoading ||               // انتظر تحميل بيانات تيليجرام (المحاولة الأولية/إعادة المحاولة)
    (isTelegramApp && !isTelegramReady); // إذا كنا في تيليجرام، انتظر حتى تصبح البيانات جاهزة

  // طباعة حالة الشروط للمساعدة في التصحيح
  console.log("⏳ Splash Screen Conditions:", {
      minDelayCompleted,
      isWalletLoading,
      isTelegramLoading,
      isTelegramApp,
      isTelegramReady,
      showSplashScreen // النتيجة النهائية
  });
  // -----------------------------------------------------

  // إذا كان يجب عرض شاشة البداية
  if (showSplashScreen) {
    // يمكنك تمرير حالة تحميل حقيقية إلى SplashScreen إذا أردت تطويره لاحقًا
    // مثال: <SplashScreen isLoading={isWalletLoading || isTelegramLoading} />
    return <SplashScreen />;
  }

  // التعامل مع خطأ تحميل المحفظة (بعد تجاوز شاشة البداية)
  if (isWalletError) {
    console.error("❌ Wallet Address fetch error:", walletError);
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center px-4">
        <p className="mb-2">حدث خطأ أثناء تحميل بيانات المحفظة.</p>
        {/* عرض تفاصيل الخطأ للمطورين أو في بيئة التطوير */}
        {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mb-4">{(walletError as Error)?.message || String(walletError)}</p>
        )}
        <button
          onClick={() => {
            // محاولة إعادة تحميل البيانات بدلاً من الصفحة بأكملها
            queryClient.refetchQueries({ queryKey: ['walletAddress'] });
            // أو إعادة تحميل الصفحة كحل أخير
            // window.location.reload();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // --- ✅ التعديل: التأكد من أن التطبيق جاهز ---
  // إذا وصلنا إلى هنا، فالتأخير الأدنى قد مر، والمحفظة وبيانات تيليجرام (إذا كانت مطلوبة) تم تحميلها.
  console.log(`✅ App Ready. Running inside Telegram: ${isTelegramApp}. Telegram ID: ${telegramId || 'N/A'}`);
  // -------------------------------------------

  // عرض المحتوى الرئيسي للتطبيق
  return (
    <>
      {/* تأكد من أن المكونات التي تعتمد على telegramId تتحقق منه داخليًا أو تستخدم React Query مع `enabled` */}
      {children}
      <FooterNav />
      <NotificationToast />
    </>
  );
}

// المكون الرئيسي للتطبيق الذي يقوم بإعداد الـ Providers
function MyApp({ Component, pageProps }: AppProps) {
  return (
    // توفير سياق تيليجرام لجميع المكونات
    <TelegramProvider>
      {/* توفير QueryClient لإدارة حالة الخادم */}
      <QueryClientProvider client={globalQueryClient}>
        {/* توفير سياق الإشعارات */}
        <NotificationsProvider>
          {/* عرض محتوى التطبيق (بما في ذلك شاشة البداية والمنطق الرئيسي) */}
          <AppContent>
            <Component {...pageProps} />
          </AppContent>
          {/* أدوات تطوير React Query (تظهر فقط في بيئة التطوير) */}
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationsProvider>
      </QueryClientProvider>
    </TelegramProvider>
  );
}

export default MyApp;
