// pages/notifications.tsx
'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ArrowLeft, Bell, Check, RefreshCw } from 'lucide-react'
import NotificationFilter from '@/components/NotificationFilter'
import { useTelegram } from '../context/TelegramContext'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { NotificationType } from '@/types/notification'

// استيراد ديناميكي لمكون NotificationItem مع هيكل تحميل محسن
const NotificationItem = dynamic(
  () => import('@/components/NotificationItem'),
  {
    loading: () => <NotificationSkeleton />
  }
)

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
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded-full w-24 animate-pulse"></div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
    </div>
  </motion.div>
)

// مكون هيكل تحميل للصفحة الأولى
const PageSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-4">
    {/* محاكاة شريط التصفية */}
    <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
      <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
    </div>

    {/* محاكاة 5 إشعارات */}
    {[...Array(5)].map((_, i) => (
      <NotificationSkeleton key={`skeleton-${i}`} />
    ))}
  </div>
)

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = (searchParams.get('filter') || 'all') as 'all' | 'unread'
  const { telegramId } = useTelegram()
  const { setUnreadCount } = useNotificationsContext()
  const queryClient = useQueryClient()

  // إضافة مرجع للتمرير والسحب للتحديث
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(0)
  const [startY, setStartY] = useState(0)

  // إضافة حالة لتتبع الإشعارات الجديدة (IDs)
  const [newNotificationIds, setNewNotificationIds] = useState<number[]>([])

  // استخدام Hook المحسن لجلب الإشعارات
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useNotifications(telegramId, filter)

  // تنفيذ وظيفة التحديث بالسحب
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 5 && diff < 100 && scrollRef.current && scrollRef.current.scrollTop === 0) {
      setRefreshProgress(Math.min(diff / 80 * 100, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (refreshProgress > 70) {
      setIsRefreshing(true)
      try {
        await refetch()
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] })
      } finally {
        setTimeout(() => {
          setIsRefreshing(false)
          setRefreshProgress(0)
          setStartY(0)
        }, 600)
      }
    } else {
      setRefreshProgress(0)
      setStartY(0)
    }
  }

  // التعامل مع رسائل WebSocket وتحديث الإشعارات
  const handleSocketMessage = useCallback(
    (message: { type: string; data?: unknown }) => {
      if (message.type === 'unread_update') {
        const data = message.data as { count?: number }
        if (data?.count !== undefined) {
          setUnreadCount(data.count)
        }
      } else if (message.type === 'new_notification' && message.data) {
        const newNotification = message.data as NotificationType

        if (newNotification.id) {
          if (filter === 'all' || (filter === 'unread' && !newNotification.read_status)) {
            queryClient.setQueryData(
              ['notifications', telegramId, filter],
              (oldData: { pages: NotificationType[][], pageParams: (string | undefined)[] } | undefined) => {
                if (!oldData || !oldData.pages) { // تبسيط الشرط قليلاً
                  return {
                    pages: [[newNotification]],
                    pageParams: [undefined]
                  };
                }

                const updatedPages = [...oldData.pages]; // تهيئة updatedPages

                // إذا لم تكن هناك صفحات على الإطلاق (حالة نادرة إذا مر الشرط الأول)
                if (updatedPages.length === 0) {
                    updatedPages.push([newNotification]);
                } else {
                    const firstPage = updatedPages[0] || [];
                    // تحقق مما إذا كان الإشعار موجودًا بالفعل في الصفحة الأولى
                    if (firstPage.some(n => n.id === newNotification.id)) {
                      return oldData;
                    }
                    updatedPages[0] = [newNotification, ...firstPage];
                }

                return {
                  ...oldData,
                  pages: updatedPages
                };
              }
            );
          }

          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
          setNewNotificationIds(prev => [...prev, newNotification.id]);
          setTimeout(() => {
            setNewNotificationIds(prev => prev.filter(id => id !== newNotification.id));
          }, 5000);
        }
      }
    },
    [setUnreadCount, queryClient, telegramId, filter]
  );

  // الاتصال بالويب سوكيت مع معالجة أفضل للاتصال
  const { isConnected, markAllAsRead } = useNotificationsSocket(telegramId, handleSocketMessage)

  // جلب عدد الإشعارات غير المقروءة مع استراتيجية تخزين مؤقت محسنة
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadNotificationsCount', telegramId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`,
        { params: { telegram_id: telegramId } }
      )
      return data.unread_count as number
    },
    enabled: !!telegramId,
    staleTime: 30000, // تعتبر البيانات حديثة لمدة 30 ثانية
    refetchOnWindowFocus: true // إعادة الجلب عند التركيز على النافذة
  })

  // تعليم جميع الإشعارات كمقروءة عند دخول الصفحة (فقط إذا كان الفلتر "all")
  useEffect(() => {
    if (telegramId && isConnected && filter === 'all') {
      markAllAsRead()
    }
  }, [telegramId, isConnected, filter, markAllAsRead])

  // تلقائي تحميل المزيد عند الوصول إلى نهاية الصفحة
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        if (scrollHeight - scrollTop - clientHeight < 200 && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }
    }

    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // تجميع جميع الإشعارات في مصفوفة واحدة
  const notifications = data?.pages.flat() || []

  const handleGoBack = () => {
    router.push('/')
  }

  // استخدام متغير للتحكم بتنسيقات مختلفة
  const themeColors = {
    primary: 'blue',
    accent: 'indigo',
    background: 'gray-50',
    cardBg: 'white',
    unreadBg: 'blue-50',
    unreadBorder: 'blue-200',
  }

  // حالة التحميل الأولية
  if (isLoading && notifications.length === 0) {
    return <PageSkeleton />
  }



  // حالة الخطأ المحسنة
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">


        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 p-6 rounded-xl text-red-600 mb-6 text-center max-w-md w-full border border-red-100 shadow-sm"

        >
          <AlertCircle className="mx-auto h-12 w-12 mb-4 text-red-500" />
          <h3 className="text-lg font-bold mb-2">حدث خطأ أثناء تحميل الإشعارات</h3>
          <p className="mb-4 text-sm text-red-500">تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
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
    )
  }

  return (
    <div
      className={`relative min-h-screen bg-${themeColors.background} z-20`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* مؤشر السحب للتحديث - تم تحسينه */}
      {(refreshProgress > 0 || isRefreshing) && (
        <motion.div 
          className="absolute top-0 left-0 right-0 flex justify-center z-20 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: refreshProgress > 0 ? Math.min(refreshProgress / 2, 20) : 0 
          }}
        >
          <div className={`p-2 rounded-full shadow-md ${
            isRefreshing ? 'bg-white' : 'bg-gradient-to-r from-blue-100 to-indigo-100'
          }`}>
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : refreshProgress * 3.6 }}
              transition={{ duration: isRefreshing ? 1 : 0 }}
            >
              <RefreshCw size={24} className={`text-${themeColors.primary}-500`} />
            </motion.div>
          </div>
        </motion.div>
      )}

      <div
        ref={scrollRef}
        className="container mx-auto px-4 py-6 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        id="scrollableDiv"
      >
        {/* رأس الصفحة مع زر الرجوع ومؤشر الاتصال المتحرك */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
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
          <h1 className="text-xl font-bold flex-1 text-center text-gray-800">الإشعارات</h1>

          {/* مؤشر حالة الاتصال مع تلميحات */}
          <div className="relative group">
            <motion.div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              animate={{
                scale: [1, isConnected ? 1.2 : 1.3, 1],
                boxShadow: isConnected
                  ? ['0 0 0 0 rgba(34, 197, 94, 0)', '0 0 0 4px rgba(34, 197, 94, 0.3)', '0 0 0 0 rgba(34, 197, 94, 0)']
                  : ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 4px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)']
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <div className="absolute top-6 right-0 transform translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity w-max">
              {isConnected ? 'متصل بالخادم' : 'غير متصل'}
            </div>
          </div>
        </motion.div>

        {/* شريط حالة الإشعارات غير المقروءة مع حركة دخول بسيطة */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`mb-5 bg-gradient-to-r from-${themeColors.primary}-50 to-${themeColors.accent}-50 p-4 rounded-xl shadow-sm border border-${themeColors.primary}-100 flex items-center justify-between`}
        >
          <div className="flex items-center">
            <Bell size={20} className={`text-${themeColors.primary}-500 mr-2`} />
            <span className="font-semibold text-gray-700">الإشعارات غير المقروءة:</span>
          </div>
          <motion.span
  className={`inline-flex items-center justify-center bg-${themeColors.primary}-500 text-white rounded-full px-3 py-1 text-sm font-medium`}
  initial={{ scale: 1 }}
  animate={{
    scale: unreadCountData && unreadCountData > 0 ? [1, 1.1] : 1
  }}
  transition={{
    duration: 0.3,
    repeat: unreadCountData && unreadCountData > 0 ? Infinity : 0,
    repeatType: "mirror"
  }}
>
  {unreadCountData || 0}
</motion.span>
        </motion.div>

        {/* مكون التصفية المحسن */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <NotificationFilter
            currentFilter={filter}
            unreadCount={unreadCountData || 0}
            onMarkAllAsRead={markAllAsRead}
          />
        </motion.div>

        {/* حالة فارغة محسنة في حال عدم وجود إشعارات */}
        {notifications.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 mt-6 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 scale-150 animate-pulse"></div>
              <Bell size={80} className="text-gray-400 relative z-10" />
            </motion.div>
            <p className="text-lg font-medium">لا توجد إشعارات {filter === 'unread' ? 'غير مقروءة' : ''}</p>
            <p className="text-sm text-gray-400 mt-2 max-w-xs text-center">
              {filter === 'unread'
                ? 'قمت بقراءة جميع الإشعارات. ستظهر الإشعارات الجديدة هنا فور وصولها.'
                : 'ستظهر الإشعارات هنا عندما تتلقى تحديثات جديدة أو إشعارات من النظام.'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className={`mt-6 bg-${themeColors.primary}-50 text-${themeColors.primary}-600 border border-${themeColors.primary}-200 hover:bg-${themeColors.primary}-100 px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              تحديث
            </motion.button>
          </motion.div>
        )}

        {/* قائمة الإشعارات المحسنة */}
        {notifications.length > 0 ? (
          <motion.div className="space-y-4">
            <AnimatePresence initial={false}>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: newNotificationIds.includes(notification.id)
                      ? ['#ffffff', '#f0f9ff', '#ffffff']
                      : undefined
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index < 5 ? index * 0.05 : 0,
                    backgroundColor: { repeat: 3, duration: 1 }
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={async () => await markAllAsRead()}
                    isNew={newNotificationIds.includes(notification.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : null}
        {/* زر تحميل المزيد (يظهر فقط عند التمرير اليدوي قبل الوصول للنهاية) */}
        {hasNextPage && notifications.length > 0 && !isFetchingNextPage && (
          <div className="flex justify-center my-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchNextPage()}
              className={`bg-white text-${themeColors.primary}-600 border border-${themeColors.primary}-200 hover:bg-${themeColors.primary}-50 px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              تحميل المزيد
            </motion.button>
          </div>
        )}

        {/* مؤشر تحميل المزيد بتصميم محسن */}
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

        {/* رسالة نهاية القائمة - تم تحسينها */}
        {!hasNextPage && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center my-6 pb-4"
          >
            <div className="inline-flex items-center text-gray-400 text-sm bg-gray-50 px-4 py-2 rounded-full">
              <Check size={16} className="mr-2" />
              لقد شاهدت جميع الإشعارات
            </div>
          </motion.div>
        )}
      </div>
    </div>
    
  );
}
