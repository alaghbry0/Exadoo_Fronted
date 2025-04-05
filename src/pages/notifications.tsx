// pages/notifications.tsx
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'


// تعريف الأنواع
type Notification = {
  id: number
  type: string
  title?: string
  message: string
  created_at: string
  read_status: boolean
  extra_data?: {
    subscription_history_id?: number
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 10

  const telegramId = typeof window !== 'undefined' ? localStorage.getItem('telegram_id') : null

  const fetchData = useCallback(async () => { // استخدم useCallback هنا
  try {
    const [notificationsRes, unreadRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`, {
        params: {
          offset,
          limit,
          telegram_id: telegramId
        }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread/count`, {
        params: { telegram_id: telegramId }
      })
    ])

    setNotifications(notificationsRes.data)
    setUnreadCount(unreadRes.data.unread_count)
    setError('')
  } catch (err) {
    console.error('فشل في جلب البيانات:', err)
    setError('حدث خطأ أثناء تحميل الإشعارات')
  } finally {
    setLoading(false)
  }
}, [offset, limit, telegramId]) // أضف التبعيات هنا

useEffect(() => {
  if (!telegramId) return
  fetchData()
}, [telegramId, offset, fetchData])


  const handleLoadMore = () => setOffset(prev => prev + limit)

  if (loading) return <div className="p-4 text-center">جاري التحميل...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">الإشعارات</h1>

      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
        <span className="font-semibold">الإشعارات غير المقروءة:</span>
        <span className="mr-2">{unreadCount}</span>
      </div>

      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-4 rounded-lg border ${
              !notification.read_status
                ? 'bg-white border-blue-200 shadow-sm'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Link
              href={`/notifications/${notification.id}?telegram_id=${telegramId}`}
              className="block hover:bg-gray-50 transition-colors"
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
            </Link>
          </li>
        ))}
      </ul>

      {notifications.length >= limit && (
        <button
          onClick={handleLoadMore}
          className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg"
        >
          تحميل المزيد
        </button>
      )}
    </div>
  )
}