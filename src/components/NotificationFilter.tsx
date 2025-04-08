
import React from 'react';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

type FilterType = 'all' | 'unread';

interface NotificationFilterProps {
  currentFilter: FilterType;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationFilter = ({ 
  currentFilter, 
  unreadCount, 
  onMarkAllAsRead 
}: NotificationFilterProps) => {
  const router = useRouter();
const searchParams = new URLSearchParams(router.asPath.split('?')[1] || '');

  const handleFilterChange = (filter: FilterType) => {
    if (filter === currentFilter) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    router.push(`/notifications?${params.toString()}`);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (unreadCount === 0) return;
    onMarkAllAsRead();
  };

  return (
    <div className="mb-5 rounded-xl bg-white p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-800">تصفية الإشعارات</h2>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle size={14} />
              <span>تحديد الكل كمقروء</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleFilterChange('all')}
          className={`relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 flex justify-center items-center gap-2 ${
            currentFilter === 'all'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Bell size={16} />
          <span>جميع الإشعارات</span>
          
          {currentFilter === 'all' && (
            <motion.div
              layoutId="filterIndicator"
              className="absolute inset-0 bg-white rounded-md -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleFilterChange('unread')}
          className={`relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            currentFilter === 'unread'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Bell size={16} />
            <span>غير المقروءة</span>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {currentFilter === 'unread' && (
            <motion.div
              layoutId="filterIndicator"
              className="absolute inset-0 bg-white rounded-md -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default NotificationFilter;