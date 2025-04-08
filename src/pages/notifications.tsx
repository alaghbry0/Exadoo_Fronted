// pages/notifications.tsx
'use client'
import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import InfiniteScroll from 'react-infinite-scroll-component'
import { FiArrowLeft, FiBell } from 'react-icons/fi'
import { Spinner } from '@/components/Spinner'
import NotificationFilter from '@/components/NotificationFilter'
import { NotificationType } from '@/types/notification'
import { useTelegram } from '../context/TelegramContext'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { useNotifications } from '@/hooks/useNotifications'
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Dynamic import for better performance
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

  // Get notifications with our enhanced hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useNotifications(telegramId, filter)

  // Handle WebSocket messages
  const handleSocketMessage = useCallback((message) => {
    if (message.type === 'unread_update' && message.data?.count !== undefined) {
      setUnreadCount(message.data.count)
    } else if (message.type === 'new_notification') {
      // Add the new notification to the cache and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId, filter] })
    }
  }, [setUnreadCount, queryClient, telegramId, filter])

  // Connect to WebSocket
  const { isConnected, markAllAsRead } = useNotificationsSocket(telegramId, handleSocketMessage)

  // Fetch unread notifications counter
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

  // Mark all as read when entering the page
  useEffect(() => {
    if (telegramId && isConnected) {
      // Only mark as read if we're on the notifications page
      markAllAsRead()
    }
  }, [telegramId, isConnected, markAllAsRead])

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Flatten all pages into a single array
  const notifications = data?.pages.flat() || []

  // Handle back button
  const handleGoBack = () => {
    router.back()
  }

  // Loading state
  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <div className="animate-pulse">
          <FiBell size={40} className="text-blue-500" />
        </div>
        <p className="text-gray-600">جارٍ جلب بيانات الإشعارات...</p>
      </div>
    )
  }

  // Error state
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
    <div
      className="container mx-auto p-4 bg-gray-50 min-h-screen"
      id="scrollableDiv"
    >
      {/* Header with connection status */}
      <div className="flex items-center mb-6 sticky top-0 bg-gray-50 z-10 py-2">
        <button
          onClick={handleGoBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex-1 text-center">الإشعارات</h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Unread count badge */}
      <div className="mb-4 bg-blue-50 p-3 rounded-lg text-center">
        <span className="font-semibold">الإشعارات غير المقروءة: </span>
        <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
          {unreadCountData || 0}
        </span>
      </div>

      {/* Filter */}
      <NotificationFilter currentFilter={filter} />

      {/* Empty state */}
      {notifications.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FiBell size={48} className="mb-4 opacity-50" />
          <p>لا توجد إشعارات {filter === 'unread' ? 'غير مقروءة' : ''}</p>
        </div>
      )}

      {/* Notifications list */}
      <InfiniteScroll
        dataLength={notifications.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex items-center justify-center py-4">
            <Spinner />
            <span className="mr-2 text-gray-600">جارٍ التحميل...</span>
          </div>
        }
        endMessage={
          notifications.length > 0 ? (
            <p className="text-center my-4 text-gray-500">
              لا توجد المزيد من الإشعارات
            </p>
          ) : null
        }
        refreshFunction={handleRefresh}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        pullDownToRefreshContent={
          <div className="text-center py-3 text-gray-500">
            اسحب للأسفل للتحديث
          </div>
        }
        releaseToRefreshContent={
          <div className="text-center py-3 text-blue-500">
            حرر للتحديث
          </div>
        }
        scrollableTarget="scrollableDiv"
      >
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              telegramId={telegramId!}
            />
          ))}
        </div>
      </InfiniteScroll>

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center my-4">
          <Spinner />
        </div>
      )}
    </div>
  )
}