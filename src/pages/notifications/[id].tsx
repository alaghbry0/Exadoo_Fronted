// pages/notifications/[id].tsx
'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import { FiArrowRight, FiBell, FiCalendar, FiClock, FiLink } from 'react-icons/fi'
import { Spinner } from '@/components/Spinner'
import { NotificationType } from '@/types/notification'
import { useTelegram } from '@/context/TelegramContext'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

// دالة مساعدة لتحويل التواريخ
const formatArabicDate = (dateString?: string) => {
  if (!dateString) return 'غير محدد';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function NotificationDetails({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const routeParams = useParams(); // استخدام hook جديد للحصول على المعلمات

  // الحصول على معرف الإشعار من params (المرسل عبر الـprops) أو من hook الطريق
  const notificationId = params?.id || routeParams?.id as string;

  const { telegramId } = useTelegram();
  const { markAsRead } = useNotificationsContext();
  const queryClient = useQueryClient();

  // التحقق من وجود المعرف قبل إجراء الاستعلام
  const enabled = !!telegramId && !!notificationId;

  const {
    data: notification,
    isLoading,
    error,
    isError
  } = useQuery<NotificationType>({
    queryKey: ['notification', notificationId, telegramId],
    queryFn: async () => {
      // التحقق من وجود المعلمات المطلوبة
      if (!notificationId || !telegramId) {
        throw new Error('معرف الإشعار أو معرف تليجرام غير متوفر');
      }

      const cachedItem = localStorage.getItem(`notification_${notificationId}_${telegramId}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notification/${notificationId}`,
        { params: { telegram_id: telegramId } }
      );

      localStorage.setItem(
        `notification_${notificationId}_${telegramId}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000
  });

  // تحسين إدارة الحالة مع useEffect وتأكد من وجود البيانات
  useEffect(() => {
    const handleMarkAsRead = async () => {
      // تحقق من كل الشروط بشكل صريح
      if (notification && typeof notification.id !== 'undefined' && !notification.read_status && telegramId) {
        try {
          await markAsRead(notification.id);

          // تحديث البيانات في ذاكرة التخزين المؤقت
          queryClient.setQueryData(
            ['notification', notificationId, telegramId],
            (oldData: any) => {
              if (!oldData) return oldData;
              return { ...oldData, read_status: true };
            }
          );
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
      }
    };

    // تنفيذ دالة تحديد حالة القراءة فقط إذا كانت كل الشروط متوفرة
    if (notification && telegramId) {
      handleMarkAsRead();
    }
  }, [notification, telegramId, markAsRead, queryClient, notificationId]);

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'غير معروف';
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar
    });
  };

  const getNotificationIcon = () => {
    switch (notification?.type) {
      case 'subscription_renewal':
        return <FiCalendar className="w-8 h-8 text-green-600" />;
      case 'subscription_expiry':
        return <FiClock className="w-8 h-8 text-orange-600" />;
      default:
        return <FiBell className="w-8 h-8 text-blue-600" />;
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // تحقق ما إذا كان هناك معرف للإشعار أو معرف للمستخدم
  if (!notificationId || !telegramId) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center max-w-md w-full">
          <FiBell className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            بيانات غير كافية
          </h2>
          <p className="text-red-600 mb-4">
            معرف الإشعار أو معرف المستخدم غير متوفر
          </p>
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner className="w-12 h-12 mb-4" />
        <p className="text-gray-600">جاري تحميل تفاصيل الإشعار...</p>
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center max-w-md w-full">
          <FiBell className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            تعذر تحميل الإشعار
          </h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل بيانات الإشعار'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['notification', notificationId] })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              العودة
            </button>
          </div>
        </div>
      </div>
    );
  }


    return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={handleGoBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
        >
          <FiArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex-1 text-center">تفاصيل الإشعار</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            {getNotificationIcon()}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-2">
                {notification.title || notification.type?.replace(/_/g, ' ')}
              </h2>
              <span className="text-sm text-gray-500">
                {getRelativeTime(notification.created_at)}
              </span>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {notification.message}
            </p>

            <div className="text-sm text-gray-500">
              {formatArabicDate(notification.created_at)}
            </div>
          </div>
        </div>
      </div>

      {notification.subscription_history && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
            تفاصيل الاشتراك
          </h3>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-32 text-gray-600">نوع الاشتراك:</span>
              <span className="font-medium">
                {notification.subscription_history.subscription_type_name || 'غير محدد'}
              </span>
            </div>

            <div className="flex items-center">
              <span className="w-32 text-gray-600">خطة الاشتراك:</span>
              <span className="font-medium">
                {notification.subscription_history.subscription_plan_name || 'غير محددة'}
              </span>
            </div>

            <div className="flex items-center">
              <span className="w-32 text-gray-600">تاريخ التجديد:</span>
              <span className="font-medium">
                {formatArabicDate(notification.subscription_history.renewal_date)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="w-32 text-gray-600">تاريخ الانتهاء:</span>
              <span className="font-medium">
                {formatArabicDate(notification.subscription_history.expiry_date)}
              </span>
            </div>

            {notification.subscription_history?.invite_link && (
  <div className="mt-6">
    <a
      href={notification.subscription_history.invite_link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      aria-label="الانضمام إلى القناة عبر الرابط"
    >
      <FiLink className="w-5 h-5" />
      <span>الانضمام إلى القناة</span>
    </a>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}