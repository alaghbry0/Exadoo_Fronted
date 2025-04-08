// components/NotificationFilter.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { motion } from 'framer-motion'

type FilterType = 'all' | 'unread'

interface NotificationFilterProps {
  currentFilter: FilterType;
}

const NotificationFilter = ({ currentFilter }: NotificationFilterProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { unreadCount, markAllAsRead } = useNotificationsContext()

  const handleFilterChange = (filter: FilterType) => {
    if (filter === currentFilter) return;

    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    router.push(`/notifications?${params.toString()}`)
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (unreadCount === 0) return;

    await markAllAsRead()
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-gray-700">تصفية الإشعارات</h2>

        {unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={handleMarkAllAsRead}
          >
            تحديد الكل كمقروء
          </motion.button>
        )}
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleFilterChange('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentFilter === 'all'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          جميع الإشعارات
        </button>

        <button
          onClick={() => handleFilterChange('unread')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentFilter === 'unread'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center">
            <span>غير المقروءة</span>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

export default NotificationFilter