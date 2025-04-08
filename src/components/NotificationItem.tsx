// components/NotificationItem.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { FiBell, FiClock, FiCalendar, FiAlertCircle, FiCheck, FiChevronRight } from 'react-icons/fi'
import { useSwipeable } from 'react-swipeable'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { NotificationType } from '@/types/notification'
import { motion } from 'framer-motion'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { useTelegram } from '@/context/TelegramContext'

interface NotificationItemProps {
  notification: NotificationType
  telegramId: string
}

const NotificationItem = ({ notification, telegramId }: NotificationItemProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const { markAsRead } = useNotificationsContext()

  // تحديد أيقونة الإشعار حسب النوع
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'subscription_renewal':
        return <FiCalendar className="w-5 h-5 text-green-500" />
      case 'payment_success':
        return <FiCheck className="w-5 h-5 text-green-500" />
      case 'subscription_expiry':
        return <FiClock className="w-5 h-5 text-orange-500" />
      case 'system_notification':
        return <FiAlertCircle className="w-5 h-5 text-blue-500" />
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />
    }
  }

  // تنسيق التاريخ بشكل نسبي للوقت الحالي
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar
  })

  // تعامل مع الضغط على الإشعار
  const handleNotificationClick = () => {
    if (notification && notification.id) {
      router.push(`/notifications/${notification.id}`)

      // تطبيق التحديث التفاعلي لحالة القراءة
      if (!notification.read_status) {
        queryClient.setQueryData(
          ['notifications', telegramId, 'all'],
          (oldData: any) => {
            if (!oldData) return oldData

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) =>
                page.map((item: any) =>
                  item.id === notification.id ? { ...item, read_status: true } : item
                )
              )
            }
          }
        )
        markAsRead(notification.id)
      }
    }
  }

  // تعامل مع تحديث حالة القراءة
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.read_status || isMarking) return

    setIsMarking(true)
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notification.id}/mark-read`,
        null,
        { params: { telegram_id: telegramId } }
      )

      // تحديث حالة الإشعار محليًا
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] })

      // استخدام دالة markAsRead من السياق
      markAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    } finally {
      setIsMarking(false)
    }
  }

  // إعداد التفاعل مع السحب للأجهزة المحمولة
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!notification.read_status) {
        handleMarkAsRead(new Event('swipe') as any)
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  })

  return (
    <motion.div
      {...swipeHandlers}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-lg shadow-sm border ${
        notification.read_status ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      } transition-all duration-200 hover:shadow-md`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start">
        <div className="p-2 rounded-full bg-gray-100 mr-3">
          {getNotificationIcon()}
        </div>

        <div className="flex-1">
          <div className="flex flex-col">
            <h3 className={`font-semibold text-gray-900 ${!notification.read_status && 'text-blue-700'}`}>
              {notification.title || notification.type.replace(/_/g, ' ')}
            </h3>

            <p className={`mt-1 text-sm ${notification.read_status ? 'text-gray-600' : 'text-gray-800'}`}>
              {notification.message.length > 120 && !isExpanded
                ? `${notification.message.substring(0, 120)}...`
                : notification.message}
            </p>

            {notification.message.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="text-blue-600 text-sm mt-1 hover:underline"
              >
                {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}

            <span className="text-xs text-gray-500 mt-2">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center">
          {!notification.read_status && (
            <button
              onClick={handleMarkAsRead}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              disabled={isMarking}
              aria-label="تحديد كمقروء"
            >
              {isMarking ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-5 h-5" />
              )}
            </button>
          )}
          <FiChevronRight className="w-5 h-5 text-gray-400 ml-1" />
        </div>
      </div>

      {notification.extra_data && notification.extra_data.subscription_history_id && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            يحتوي على معلومات الاشتراك
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default NotificationItem
