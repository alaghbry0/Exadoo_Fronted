// pages/notifications.tsx
'use client'
import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import InfiniteScroll from 'react-infinite-scroll-component'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bell, RefreshCw, AlertTriangle } from 'lucide-react'
import { Spinner } from '@/components/Spinner'
import NotificationFilter from '@/components/NotificationFilter'
import { useTelegram } from '../context/TelegramContext'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// استيراد ديناميكي لمكون NotificationItem لتحسين الأداء
const NotificationItem = dynamic(
  () => import('@/components/NotificationItem'),
  { loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div> }
)

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = (searchParams.get('filter') || 'all') as 'all' | 'unread'
  const { telegramId } = useTelegram()
  const { setUnreadCount } = useNotificationsContext()
  const queryClient = useQueryClient()

  // جلب الإشعارات باستخدام الـ hook المخصص
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useNotifications(telegramId, filter)

  // التعامل مع رسائل الويب سوكيت
  const handleSocketMessage = useCallback((message) => {
    if (message.type === 'unread_update' && message.data?.count !== undefined) {
      setUnreadCount(message.data.count)
    } else if (message.type === 'new_notification') {
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId, filter] })
    }
  }, [setUnreadCount, queryClient, telegramId, filter])

  // الاتصال بالويب سوكيت
  const { isConnected, markAllAsRead } = useNotificationsSocket(telegramId, handleSocketMessage)

  // جلب عدد الإشعارات غير المقروءة
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadNotificationsCount', telegramId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`,
        { params: { telegram_id: telegramId } }
      )
      return data.unread_count as number
    },
    enabled: !!telegramId
  })

  // تعليم كل الإشعارات كمقروءة عند الدخول للصفحة (في حال كان الويب سوكيت متصل)
  useEffect(() => {
    if (telegramId && isConnected) {
      markAllAsRead()
    }
  }, [telegramId, isConnected, markAllAsRead])

  // دالة التحديث عند السحب للأسفل
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // تجميع جميع الإشعارات في مصفوفة واحدة
  const notifications = data?.pages.flat() || []


  const handleGoBack = () => {
      router.back(`/index`);
  };

  // حالة التحميل الأولية
  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
          <Bell size={40} className="text-blue-500" />
        </motion.div>
        <p className="text-gray-600">جارٍ جلب بيانات الإشعارات...</p>
      </div>
    )
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
          حدث خطأ أثناء تحميل الإشعارات
        </div>
        <button
          onClick={() => refetch()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen" id="scrollableDiv">
      {/* رأس الصفحة مع زر الرجوع ومؤشر الاتصال المتحرك */}
      <div className="flex items-center mb-6 sticky top-0 bg-gray-50 z-10 py-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold p-3 rounded-full shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="text-xl font-bold flex-1 text-center text-gray-800">الإشعارات</h1>
        <motion.div
          className="w-3 h-3 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ backgroundColor: isConnected ? '#22c55e' : '#ef4444' }}
        />
      </div>

      {/* شريط حالة الإشعارات غير المقروءة مع حركة دخول بسيطة */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between"
      >
        <div className="flex items-center">
          <Bell size={20} className="text-blue-500 mr-2" />
          <span className="font-semibold text-gray-700">الإشعارات غير المقروءة:</span>
        </div>
        <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-medium">
          {unreadCountData || 0}
        </span>
      </motion.div>

      {/* مكون التصفية */}
      <NotificationFilter currentFilter={filter} />

      {/* حالة فارغة في حال عدم وجود إشعارات */}
      {notifications.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 mt-4 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="mb-4 opacity-50"
          >
            <Bell size={64} className="text-gray-400" />
          </motion.div>
          <p className="text-lg">لا توجد إشعارات {filter === 'unread' ? 'غير مقروءة' : ''}</p>
          <p className="text-sm text-gray-400 mt-2">ستظهر هنا عند استلامك إشعارات جديدة</p>
        </motion.div>
      )}

      {/* عرض قائمة الإشعارات بنظام Infinite Scroll */}
      <InfiniteScroll
        dataLength={notifications.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex items-center justify-center py-6">
            <Spinner />
            <span className="mr-3 text-gray-600 font-medium">جارٍ التحميل...</span>
          </div>
        }
        endMessage={
          notifications.length > 0 ? (
            <p className="text-center my-6 py-3 text-gray-500 bg-gray-100 rounded-lg">
              لقد وصلت إلى نهاية الإشعارات
            </p>
          ) : null
        }
        refreshFunction={handleRefresh}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        pullDownToRefreshContent={
          <div className="text-center py-4 text-gray-500 flex items-center justify-center">
            <RefreshCw size={24} className="animate-bounce mr-2" />
            اسحب للأسفل للتحديث
          </div>
        }
        releaseToRefreshContent={
          <div className="text-center py-4 text-blue-600 font-medium flex items-center justify-center">
            <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <RefreshCw size={24} className="mr-2" />
            </motion.div>
            حرر للتحديث
          </div>
        }
        scrollableTarget="scrollableDiv"
        className="pb-20"
      >
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  telegramId={telegramId!}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </InfiniteScroll>

      {/* مؤشر تحميل المزيد في حال كان هناك صفحات إضافية */}
      {isFetchingNextPage && (
        <div className="flex justify-center my-4">
          <Spinner />
        </div>
      )}
    </div>
  )
}
