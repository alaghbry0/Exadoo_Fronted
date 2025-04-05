// pages/notifications/[id].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

type NotificationDetails = {
  id: number
  type: string
  title?: string
  message: string
  created_at: string
  read_status: boolean
  extra_data?: {
    subscription_history_id?: number
  }
  subscription_history?: {
    invite_link?: string
    subscription_type_name?: string
    subscription_plan_name?: string
    renewal_date?: string
    expiry_date?: string
  }
}

export default function NotificationDetails() {
  const router = useRouter()
  const { id } = router.query
  const [notification, setNotification] = useState<NotificationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const telegramId = typeof window !== 'undefined' ? localStorage.getItem('telegram_id') : null

  useEffect(() => {
    if (!id || !telegramId) return

    const fetchNotification = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${id}`,
          { params: { telegram_id: telegramId } }
        )
        setNotification(data)
        setError('')
      } catch (err) {
        console.error('فشل في جلب التفاصيل:', err)
        setError('تعذر تحميل تفاصيل الإشعار')
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id, telegramId])

  if (loading) return <div className="p-4 text-center">جاري التحميل...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!notification) return <div className="p-4">الإشعار غير موجود</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        &larr; رجوع
      </button>

      <h1 className="text-2xl font-bold mb-4">تفاصيل الإشعار</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="text-gray-500 text-sm">نوع الإشعار:</label>
          <p className="font-medium">{notification.type}</p>
        </div>

        {notification.title && (
          <div className="mb-4">
            <label className="text-gray-500 text-sm">العنوان:</label>
            <p className="font-medium">{notification.title}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-gray-500 text-sm">الرسالة:</label>
          <p className="whitespace-pre-wrap">{notification.message}</p>
        </div>

        {notification.subscription_history && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-3">تفاصيل الاشتراك</h2>

            <div className="space-y-2">
              <p>
                <span className="text-gray-500">النوع:</span>{' '}
                {notification.subscription_history.subscription_type_name}
              </p>
              <p>
                <span className="text-gray-500">الخطة:</span>{' '}
                {notification.subscription_history.subscription_plan_name}
              </p>
              <p>
                <span className="text-gray-500">تاريخ التجديد:</span>{' '}
                {new Date(notification.subscription_history.renewal_date!).toLocaleDateString('ar-EG')}
              </p>
              <p>
                <span className="text-gray-500">تاريخ الانتهاء:</span>{' '}
                {new Date(notification.subscription_history.expiry_date!).toLocaleDateString('ar-EG')}
              </p>
              {notification.subscription_history.invite_link && (
                <a
                  href={notification.subscription_history.invite_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block mt-2"
                >
                  رابط الانضمام إلى القناة
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}