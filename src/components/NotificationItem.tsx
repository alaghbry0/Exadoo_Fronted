import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
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
  X,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: number) => void;
  isNew?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isNew = false,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isRippling, setIsRippling] = useState(false);
  const [showDismissButton, setShowDismissButton] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // إضافة تأثير موجة الضغط
  useEffect(() => {
    let rippleTimeout: NodeJS.Timeout;
    if (isRippling) {
      rippleTimeout = setTimeout(() => setIsRippling(false), 800);
    }
    return () => clearTimeout(rippleTimeout);
  }, [isRippling]);

  // تأثير للإشعارات الجديدة
  useEffect(() => {
    if (isNew) {
      const timeout = setTimeout(() => {
        // المؤقت سيعمل في كونتكست الإشعار، أما إلغاء التأشير فيتم خارجياً
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isNew]);

  // تحديد أيقونة الإشعار حسب النوع
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'subscription_renewal':
        return <Calendar className="w-5 h-5 text-emerald-500" strokeWidth={2} />;
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

  // تنسيق التاريخ بشكل نسبي
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ar,
  });

  // التعامل مع الضغط على الإشعار
  const handleNotificationClick = () => {
    if (notification && notification.id) {
      setIsRippling(true);
      // إحالة المستخدم لصفحة تفاصيل الإشعار
      router.push(`/notifications/${notification.id}`);
      // تحديث حالة القراءة عند الضغط، إذا كانت غير مقروءة
      if (!notification.read_status) {
        onMarkAsRead(notification.id);
      }
    }
  };

  // دالة تحديد الإشعار كمقروء
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read_status || isMarking) return;

    setIsMarking(true);
    try {
      await onMarkAsRead(notification.id);
      // تأثير بصري لتغيير الحالة
      setIsRippling(true);
    } finally {
      setTimeout(() => setIsMarking(false), 300);
    }
  };

  // دالة تجاهل الإشعار أو حذفه
  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);

    // هنا يمكن إضافة منطق حذف الإشعار إذا كان مطلوباً

    // تأثير انتقالي للحذف
    setTimeout(() => {
      // يمكن هنا إضافة API لحذف الإشعار
      setIsDismissing(false);
    }, 300);
  };

  // إعداد التعامل مع السحب للأجهزة المحمولة
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      // تفعيل كشف التمرير لليمين/اليسار
      if (eventData.dir === 'Left' && !notification.read_status) {
        // كشف سحب لليسار للتحديد كمقروء
        const progress = Math.min(Math.abs(eventData.deltaX) / 150, 1) * 100;
        setSwipeProgress(progress);
      } else if (eventData.dir === 'Right') {
        // كشف سحب لليمين لإظهار زر الحذف
        const progress = Math.min(Math.abs(eventData.deltaX) / 100, 1);
        if (progress > 0.3) {
          setShowDismissButton(true);
        }
      }
    },
    onSwipedLeft: () => {
      if (!notification.read_status && swipeProgress > 60) {
        const mockEvent = {
          stopPropagation: () => {},
          preventDefault: () => {},
          nativeEvent: new MouseEvent('click'),
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {},
          currentTarget: null,
          target: null,
          bubbles: false,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 0,
          timeStamp: 0,
          type: 'click'
        } as unknown as React.MouseEvent;
        handleMarkAsRead(mockEvent);
      }
      setSwipeProgress(0);
    },
    onSwipedRight: () => {
      // الحفاظ على زر الحذف مرئي إذا تم السحب بما فيه الكفاية
      if (!showDismissButton) {
        setShowDismissButton(false);
      }
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
      case 'payment_warning':
        className += "bg-amber-100 text-amber-800";
        label = "تحذير دفع";
        break;
      case 'payment_failed':
        className += "bg-red-100 text-red-800";
        label = "فشل عملية الدفع";
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

  // تحديد لون الخلفية والحدود حسب حالة القراءة والنوع
  const getContainerClasses = () => {
    // القاعدة الأساسية للإشعارات
    let classes = "rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md overflow-hidden ";

    // تحديد الألوان بناءً على نوع الإشعار
    if (notification.type === 'payment_warning') {
      classes += notification.read_status
        ? 'bg-white border-amber-200'
        : 'bg-amber-50 border-amber-300';
    } else if (notification.type === 'payment_failed') {
      classes += notification.read_status
        ? 'bg-white border-red-200'
        : 'bg-red-50 border-red-300';
    } else {
      classes += notification.read_status
        ? 'bg-white border-gray-200'
        : 'bg-blue-50 border-blue-200';
    }

    // إضافة تأثير الإشعار الجديد
    if (isNew) {
      classes += ' notification-new-highlight';
    }

    return classes;
  };

  // الحصول على الألوان الخاصة بكل نوع إشعار
  const getNotificationColors = () => {
    if (notification.type === 'payment_warning') {
      return {
        rippleBg: 'bg-amber-100',
        iconBg: notification.read_status ? 'bg-amber-100' : 'bg-amber-200',
        titleColor: !notification.read_status ? 'text-amber-700' : 'text-gray-900'
      };
    } else if (notification.type === 'payment_failed') {
      return {
        rippleBg: 'bg-red-100',
        iconBg: notification.read_status ? 'bg-red-100' : 'bg-red-200',
        titleColor: !notification.read_status ? 'text-red-700' : 'text-gray-900'
      };
    } else {
      return {
        rippleBg: 'bg-blue-100',
        iconBg: notification.read_status ? 'bg-gray-100' : 'bg-blue-100',
        titleColor: !notification.read_status ? 'text-blue-700' : 'text-gray-900'
      };
    }
  };

  const colors = getNotificationColors();

  return (
    <motion.div
      {...swipeHandlers}
      initial={false}
      animate={
        isDismissing
          ? { opacity: 0, x: "100%", height: 0 }
          : { opacity: 1, x: showDismissButton ? 50 : 0, height: "auto" }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${getContainerClasses()} relative`}
      onClick={handleNotificationClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      {/* زر الحذف عند السحب */}
      <AnimatePresence>
        {showDismissButton && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            onClick={handleDismiss}
          >
            <X size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* عرض شارة "جديد" إذا كان الإشعار جديد */}
      {isNew && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse-slow"
        >
          جديد
        </motion.div>
      )}

      {/* مؤشر السحب يُظهر تقدم حركة السحب */}
      {!notification.read_status && (
        <motion.div
          className={`absolute inset-0 ${colors.rippleBg}`}
          style={{ opacity: swipeProgress / 100 }}
        />
      )}

      {/* تأثير الموجة عند الضغط */}
      <AnimatePresence>
        {isRippling && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 ${colors.rippleBg} rounded-xl`}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 p-4">
        {/* أيقونة الإشعار مع خلفية دائرية */}
        <motion.div
          className={`flex-shrink-0 p-2 rounded-full ${colors.iconBg}`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {getNotificationIcon()}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            {/* عنوان الإشعار */}
            <h3 className={`font-semibold truncate ${colors.titleColor}`}>
              {notification.title || notification.type.replace(/_/g, ' ')}
            </h3>

            {/* عرض معلومات الدفع إذا كان الإشعار متعلق بالدفع */}
            {(notification.type === 'payment_warning' || notification.type === 'payment_failed' || notification.type === 'payment_success') && notification.extra_data && (
              <div className={`mt-1 text-sm ${
                notification.type === 'payment_failed' ? 'text-red-600' :
                notification.type === 'payment_warning' ? 'text-amber-600' : 'text-emerald-600'
              } font-medium`}>
                {notification.extra_data.amount && notification.extra_data.expected_amount && (
                  <>
                    <span>المبلغ المدفوع: {notification.extra_data.amount} USDT</span>
                    {notification.extra_data.difference && (
                      <span className="block mt-1">
                        {notification.type === 'payment_warning'
                          ? `(زيادة بمقدار ${notification.extra_data.difference} USDT)`
                          : notification.type === 'payment_failed'
                          ? `(نقص بمقدار ${notification.extra_data.difference} USDT)`
                          : ''}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* رسالة الإشعار مع تأثير الانزلاق */}
            <AnimatePresence initial={false} mode="wait">
              <motion.p
                key={`message-${isExpanded}`}
                initial={{ height: 'auto', opacity: 0.8 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 'auto', opacity: 0.5 }}
                transition={{ duration: 0.2 }}
                className={`mt-1 text-sm ${
                  notification.read_status ? 'text-gray-600' : 'text-gray-800'
                }`}
              >
                {notification.message.length > 100 && !isExpanded
                  ? `${notification.message.substring(0, 100)}...`
                  : notification.message}
              </motion.p>
            </AnimatePresence>

            {/* زر عرض المزيد/عرض أقل */}
            {notification.message.length > 100 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-blue-600 text-sm mt-1 hover:underline flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 mr-1" />
                </motion.span>
              </motion.button>
            )}

            {/* معلومات إضافية */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
              >
                <Clock className="w-3 h-3 ml-1" />
                {formattedDate}
              </motion.span>
              {getTypeBadge()}
              {notification.extra_data && notification.extra_data.subscription_history_id && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
                >
                  <Info className="w-3 h-3 ml-1" />
                  معلومات الاشتراك
                </motion.span>
              )}
              {/* إضافة رابط للدعم الفني في إشعارات الدفع المحددة */}
              {notification.extra_data && notification.extra_data.invite_link && (
                notification.type === 'payment_warning' || notification.type === 'payment_failed') && (
                <motion.a
                  href={notification.extra_data.invite_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center text-xs text-white bg-blue-600 px-2 py-1 rounded-full"
                >
                  <MessageSquare className="w-3 h-3 ml-1" />
                  تواصل مع الدعم
                </motion.a>
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
          <ChevronRight className="w-5 h-5 text-gray-400 mr-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;