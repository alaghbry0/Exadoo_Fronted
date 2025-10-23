// src/components/NotificationItem.tsx (النسخة النهائية والمبسطة)

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'framer-motion';
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
  ChevronRight,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';
import { NotificationType } from '@/types/notification';
import { useNotificationsContext } from '@/context/NotificationsContext'; // ✨ استيراد السياق

interface NotificationItemProps {
  notification: NotificationType;
}

// دالة مساعدة لتحديد أيقونة الإشعار (تبقى كما هي)
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'subscription_renewal':
      return <Calendar className="w-5 h-5 text-blue-500" strokeWidth={2} />;
    case 'payment_success':
      return <CreditCard className="w-5 h-5 text-emerald-500" strokeWidth={2} />;
    case 'payment_warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />;
    case 'payment_failed':
      return <AlertOctagon className="w-5 h-5 text-red-500" strokeWidth={2} />;
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

// دالة مساعدة لتحديد شارة النوع (تبقى كما هي)
const getTypeBadge = (type: string) => {
  let className = "inline-block text-xs px-2 py-1 rounded-full ";
  let label = "";
  switch (type) {
    case 'payment_success':
      className += "bg-emerald-100 text-emerald-800";
      label = "دفع ناجح";
      break;
    case 'payment_warning':
      className += "bg-amber-100 text-amber-800";
      label = "تحذير دفع";
      break;
    case 'payment_failed':
      className += "bg-red-100 text-red-800";
      label = "فشل الدفع";
      break;
    case 'system_notification':
      className += "bg-blue-100 text-blue-800";
      label = "إشعار نظام";
      break;
    default:
      return null; // لا تظهر شارة للأنواع الأخرى للتبسيط
  }
  return <span className={className}>{label}</span>;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const router = useRouter();
  const { markAsRead } = useNotificationsContext(); // ✨ استخدام السياق مباشرةً

  // ✨ تبسيط التعامل مع النقر
  const handleNotificationClick = () => {
    // 1. توجيه المستخدم إلى صفحة التفاصيل
    router.push(`/notifications/${notification.id}`);

    // 2. إذا كان الإشعار غير مقروء، قم بتمييزه كمقروء
    // هذا سيحدث تلقائيًا عند زيارة الصفحة، لكن يمكننا تسريع العملية هنا
    // لتحسين تجربة المستخدم عبر التحديث المتفائل.
    if (!notification.read_status) {
      markAsRead(notification.id);
    }
  };

  // ✨ تبسيط دالة تمييز كمقروء
  const handleMarkAsReadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // منع النقر من الوصول إلى العنصر الأب وتفعيل handleNotificationClick
    if (!notification.read_status) {
      markAsRead(notification.id);
    }
  };

  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar,
  });

  const containerClasses = `relative rounded-xl shadow-sm border p-4 flex items-start gap-3 transition-colors duration-200 hover:shadow-md cursor-pointer ${
    notification.read_status ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
  }`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={containerClasses}
      onClick={handleNotificationClick}
    >
      {/* أيقونة الإشعار */}
      <div className={`flex-shrink-0 p-2 rounded-full ${notification.read_status ? 'bg-gray-100' : 'bg-blue-100'}`}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* محتوى الإشعار */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate ${!notification.read_status ? 'text-blue-800' : 'text-gray-800'}`}>
          {notification.title}
        </h3>
        <p className={`mt-1 text-sm ${notification.read_status ? 'text-gray-600' : 'text-gray-700'}`}>
          {notification.message.substring(0, 100)}{notification.message.length > 100 ? '...' : ''}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formattedDate}</span>
          {getTypeBadge(notification.type)}
        </div>
      </div>

      {/* زر "تمييز كمقروء" */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {!notification.read_status && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMarkAsReadClick}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
            aria-label="تحديد كمقروء"
          >
            <Check className="w-5 h-5" />
          </motion.button>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
};

export default NotificationItem;