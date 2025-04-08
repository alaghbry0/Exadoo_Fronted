// components/NotificationItem.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Calendar,
  CreditCard,
  Clock,
  Info,
  MessageSquare,
  Gift,
  AlertCircle,
  Bell,
  Check,
  ChevronRight
} from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationType } from '@/types/notification'

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => Promise<void>;
  onNotificationClick: (notification: NotificationType) => void;
}



const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onNotificationClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isRippling, setIsRippling] = useState(false);

  // تحديد أيقونة الإشعار حسب النوع
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'subscription_renewal':
        return <Calendar className="w-5 h-5 text-emerald-500" strokeWidth={2} />;
      case 'payment_success':
        return <CreditCard className="w-5 h-5 text-emerald-500" strokeWidth={2} />;
      case 'subscription_expiry':
        return <Clock className="w-5 h-5 text-amber-500" strokeWidth={2} />;
      case 'system_notification':
        return <Info className="w-5 h-5 text-blue-500" strokeWidth={2} />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-indigo-500" strokeWidth={2} />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-pink-500" strokeWidth={2} />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={2} />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" strokeWidth={2} />;
    }
  };

  // تنسيق التاريخ بشكل نسبي
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar,
  });

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


  // دالة تحديد الإشعار كمقروء
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read_status || isMarking) return;

    setIsMarking(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsMarking(false);
    }
  };

  // إعداد التعامل مع السحب للأجهزة المحمولة
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left' && !notification.read_status) {
        const progress = Math.min(Math.abs(eventData.deltaX) / 150, 1) * 100;
        setSwipeProgress(progress);
      }
    },
    onSwipedLeft: () => {
      if (!notification.read_status && swipeProgress > 60) {
        handleMarkAsRead(new MouseEvent('click'));
      }
      setSwipeProgress(0);
    },
    onSwiped: () => {
      setSwipeProgress(0);
    },
    trackMouse: false,
    delta: 10,
  });

  // تحديد البادج الخاص بنوع الإشعار
  const getTypeBadge = () => {
    let className = "mt-2 inline-block text-xs px-2 py-1 rounded-full ";
    let label = "";
    switch (notification.type) {
      case 'subscription_renewal':
        className += "bg-emerald-100 text-emerald-800";
        label = "تجديد اشتراك";
        break;
      case 'payment_success':
        className += "bg-emerald-100 text-emerald-800";
        label = "دفع ناجح";
        break;
      case 'subscription_expiry':
        className += "bg-amber-100 text-amber-800";
        label = "انتهاء اشتراك";
        break;
      case 'system_notification':
        className += "bg-blue-100 text-blue-800";
        label = "إشعار نظام";
        break;
      case 'message':
        className += "bg-indigo-100 text-indigo-800";
        label = "رسالة";
        break;
      case 'promotion':
        className += "bg-pink-100 text-pink-800";
        label = "عرض ترويجي";
        break;
      case 'alert':
        className += "bg-red-100 text-red-800";
        label = "تنبيه";
        break;
      default:
        className += "bg-gray-100 text-gray-800";
        label = notification.type.replace(/_/g, ' ');
    }
    return <span className={className}>{label}</span>;
  };

  // تحديد لون الخلفية والحدود حسب حالة القراءة
  const containerClasses = `rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md overflow-hidden ${
    notification.read_status ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
  }`;

  return (
    <motion.div
      {...swipeHandlers}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${containerClasses} relative`}
      onClick={handleNotificationClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* مؤشر السحب يُظهر تقدم حركة السحب */}
      {!notification.read_status && (
        <div className="absolute inset-0 bg-blue-100" style={{ opacity: swipeProgress / 100 }} />
      )}

      {/* تأثير الموجة عند الضغط */}
      {isRippling && (
        <span className="absolute inset-0 bg-blue-100 opacity-50 animate-pulse" />
      )}

      <div className="flex items-start gap-3 p-4">
        {/* أيقونة الإشعار مع خلفية دائرية */}
        <div className={`flex-shrink-0 p-2 rounded-full ${notification.read_status ? 'bg-gray-100' : 'bg-blue-100'}`}>
          {getNotificationIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            {/* عنوان الإشعار */}
            <h3 className={`font-semibold truncate ${!notification.read_status ? 'text-blue-700' : 'text-gray-900'}`}>
              {notification.title || notification.type.replace(/_/g, ' ')}
            </h3>

            {/* رسالة الإشعار مع تأثير الانزلاق */}
            <AnimatePresence initial={false}>
              <motion.p
                key={`message-${isExpanded}`}
                initial={{ height: 'auto', opacity: 1 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 'auto', opacity: 0.5 }}
                transition={{ duration: 0.2 }}
                className={`mt-1 text-sm ${notification.read_status ? 'text-gray-600' : 'text-gray-800'}`}
              >
                {notification.message.length > 100 && !isExpanded
                  ? `${notification.message.substring(0, 100)}...`
                  : notification.message}
              </motion.p>
            </AnimatePresence>

            {/* زر عرض المزيد/عرض أقل */}
            {notification.message.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-blue-600 text-sm mt-1 hover:underline flex items-center"
              >
                {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.span>
              </button>
            )}

            {/* معلومات إضافية */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 mr-1" />
                {formattedDate}
              </span>
              {getTypeBadge()}
              {notification.extra_data && notification.extra_data.subscription_history_id && (
                <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Info className="w-3 h-3 mr-1" />
                  معلومات الاشتراك
                </span>
              )}
            </div>
          </div>
        </div>

        {/* زر تحديد كمقروء مع تأثير دوران عند الضغط */}
        <div className="flex-shrink-0 flex items-center">
          {!notification.read_status && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMarkAsRead}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              disabled={isMarking}
              aria-label="تحديد كمقروء"
            >
              {isMarking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </motion.button>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400 ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
