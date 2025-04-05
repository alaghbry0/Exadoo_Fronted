1// pages/notifications/[id].tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/Spinner'
import { NotificationType } from '@/types/notification'

export default function NotificationDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const telegramId = typeof window !== 'undefined' ? localStorage.getItem('telegram_id') : null

  const { data: notification, isLoading, error } = useQuery<NotificationType>({
    queryKey: ['notification', params.id, telegramId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/notifications/${params.id}`,
        { params: { telegram_id: telegramId } }
      )
      return data
    },
    enabled: !!telegramId && !!params.id
  })

  useEffect(() => {
    if (notification && !notification.read_status) {
      // تحديث حالة القراءة عند فتح التفاصيل
      axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/notifications/mark-as-read/${notification.type}`,
        { telegram_id: telegramId }
      ).catch(console.error)
    }
  }, [notification, telegramId])

  if (isLoading) return <Spinner className="w-12 h-12 mx-auto mt-20" />

  if (error) return (
    <div className="p-4 text-red-500 text-center">
      حدث خطأ أثناء تحميل تفاصيل الإشعار
    </div>
  )

  if (!notification) return (
    <div className="p-4 text-center">
      الإشعار غير موجود
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <span>&larr;</span>
        <span>رجوع</span>
      </button>

      <h1 className="text-2xl font-bold mb-4">تفاصيل الإشعار</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label className="text-gray-500 text-sm">نوع الإشعار:</label>
          <p className="font-medium capitalize">{notification.type.replace('_', ' ')}</p>
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

        <div className="mb-4">
          <label className="text-gray-500 text-sm">تاريخ الإرسال:</label>
          <p>
            {new Date(notification.created_at).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
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