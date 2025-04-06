// pages/notifications.tsx
'use client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import NotificationFilter from '@/components/NotificationFilter'
import { Spinner } from '@/components/Spinner'
import { NotificationType } from '@/types/notification'

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const filter = (searchParams.get('filter') || 'all') as 'all' | 'unread'
  const telegramId = typeof window !== 'undefined' ? localStorage.getItem('telegram_id') : null

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<NotificationType[]>({
    queryKey: ['notifications', telegramId, filter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get<NotificationType[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          params: {
            offset: pageParam,
            limit: 10,
            telegram_id: telegramId,
            filter
          }
        }
      )
      return data
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length * 10 : undefined,
    enabled: !!telegramId
  })

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotificationsCount', telegramId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread/count`,
        { params: { telegram_id: telegramId } }
      )
      return data.unread_count as number
    },
    enabled: !!telegramId
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <Spinner className="w-12 h-12 mx-auto mt-20" />

  if (error) return (
    <div className="p-4 text-red-500 text-center">
      حدث خطأ أثناء تحميل الإشعارات
    </div>
  )

  const notifications = data?.pages.flat() || []

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">الإشعارات</h1>

      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
        <span className="font-semibold">الإشعارات غير المقروءة:</span>
        <span className="mr-2">{unreadCount || 0}</span>
      </div>

      <NotificationFilter />

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            telegramId={telegramId!}
          />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center my-4">
          <Spinner />
        </div>
      )}

      {!hasNextPage && notifications.length > 0 && (
        <p className="text-center text-gray-500 mt-4">
          لا توجد المزيد من الإشعارات
        </p>
      )}
    </div>
  )
}

const NotificationItem = ({ notification, telegramId }: { notification: NotificationType, telegramId: string }) => {
  const router = useRouter()

  const handleMarkAsRead = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-as-read/${notification.type}`,
        { telegram_id: telegramId }
      )
      router.push(`/notifications/${notification.id}?telegram_id=${telegramId}`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        !notification.read_status
          ? 'bg-white border-blue-200 shadow-sm hover:bg-blue-50'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${
            !notification.read_status ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {notification.title || notification.type}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {new Date(notification.created_at).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {!notification.read_status && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            جديد
          </span>
        )}
      </div>
    </div>
  )
}