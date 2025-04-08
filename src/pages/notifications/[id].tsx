// pages/notifications/[id].tsx
'use client'
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  Link as LinkIcon,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/Spinner';
import { useTelegram } from '@/context/TelegramContext';
import { useNotificationsContext } from '@/context/NotificationsContext';

// مكونات الواجهة الخاصة بالبطاقة والأزرار
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/types/notification';

// دالة مساعدة لتنسيق التاريخ بالعربي
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

export default function NotificationDetail() {
  const { id: notificationId } = useParams() as { id: string };
  const router = useRouter();
  const { telegramId } = useTelegram();
  const { markAsRead } = useNotificationsContext();
  const queryClient = useQueryClient();

  // التأكد من توفر معرف الإشعار وtelegramId
  const enabled = !!telegramId && !!notificationId;

  const {
    data: notification,
    isLoading,
    error,
    isError
  } = useQuery<NotificationType>({
    queryKey: ['notification', notificationId, telegramId],
    queryFn: async () => {
      if (!notificationId || !telegramId) {
        throw new Error('معرف الإشعار أو معرف تليجرام غير متوفر');
      }

      // استخدام الكاش المحلي لمدة 5 دقائق قبل طلب بيانات جديدة
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
    enabled,
    staleTime: 5 * 60 * 1000
  });

  // بمجرد تحميل الإشعار، يتم تمييزه كمقروء (إن لم يكن كذلك)
  useEffect(() => {
    const handleMarkAsRead = async () => {
      if (notification && !notification.read_status && telegramId) {
        try {
          await markAsRead(notification.id);
          queryClient.setQueryData(['notification', notificationId, telegramId], (oldData: NotificationType | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, read_status: true };
          });
        } catch (error) {
          console.error('Failed to mark as read:', error);
        }
      }
    };

    if (notification && telegramId) {
      handleMarkAsRead();
    }
  }, [notification, telegramId, markAsRead, queryClient, notificationId]);

  // دالة للحصول على الوقت النسبي من تاريخ إنشاء الإشعار
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'غير معروف';
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar
    });
  };

  // تحديد أيقونة الإشعار بناءً على نوعه
  const getNotificationIcon = () => {
    if (!notification?.type) {
      return <Bell className="w-8 h-8 text-blue-600" />;
    }
    
    switch (notification.type) {
      case 'subscription_renewal':
        return <Calendar className="w-8 h-8 text-emerald-600" />;
      case 'payment_success':
        return <CreditCard className="w-8 h-8 text-emerald-600" />;
      case 'subscription_expiry':
        return <Clock className="w-8 h-8 text-amber-600" />;
      case 'system_notification':
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
      default:
        return <Bell className="w-8 h-8 text-blue-600" />;
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // حالة عدم توفر المعطيات الأساسية
  if (!notificationId || !telegramId) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-6 rounded-lg text-center max-w-md w-full"
        >
          <Bell className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            بيانات غير كافية
          </h2>
          <p className="text-red-600 mb-4">
            معرف الإشعار أو معرف المستخدم غير متوفر
          </p>
          <Button onClick={handleGoBack} variant="outline">
            العودة
          </Button>
        </motion.div>
      </div>
    );
  }



  // حالة التحميل
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner className="w-12 h-12 mb-4" />
        <p className="text-gray-600">جاري تحميل تفاصيل الإشعار...</p>
      </div>
    );
  }

  // حالة الخطأ أو عدم الحصول على بيانات الإشعار
  if (isError || !notification) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-6 rounded-lg text-center max-w-md w-full"
        >
          <Bell className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            تعذر تحميل الإشعار
          </h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل بيانات الإشعار'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['notification', notificationId, telegramId] })}
              className="bg-blue-600 text-white">
              إعادة المحاولة
            </Button>
            <Button onClick={handleGoBack} variant="outline">
              العودة
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {/* رأس الصفحة */}
      <div className="flex items-center mb-6 sticky top-0 bg-gray-50 z-10 py-2">
        <Button
          onClick={handleGoBack}
          variant="outline"
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>


        <h1 className="text-xl md:text-2xl font-bold flex-1 text-center">تفاصيل الإشعار</h1>
        <div className="w-10"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* بطاقة تفاصيل الإشعار */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                {getNotificationIcon()}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <h2 className="text-xl font-semibold mb-2">
                    {notification?.title || notification?.type?.replace(/_/g, ' ') || 'إشعار بدون عنوان'}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {notification?.created_at ? getRelativeTime(notification.created_at) : 'تاريخ غير معروف'}
                  </span>
                </div>

                {notification?.message ? (
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {notification.message}
                  </p>
                ) : (
                  <p className="text-gray-500 italic mb-4">لا يوجد محتوى للإشعار</p>
                )}

                {notification?.created_at ? (
                  <div className="text-sm text-gray-500">
                    {formatArabicDate(notification.created_at)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">تاريخ غير معروف</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* بطاقة تفاصيل الاشتراك/الدفع (إن وُجدت) */}
        {notification.subscription_history && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold pb-2 border-b border-gray-200">
                  تفاصيل الدفعة والاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notification.subscription_history?.amount && (
                    <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                      <h3 className="text-emerald-700 font-semibold mb-2">معلومات الدفع</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">المبلغ المدفوع:</span>
                        <span className="text-lg font-bold text-emerald-700">
                          {notification.subscription_history.amount} {notification.subscription_history.currency || ''}
                        </span>
                      </div>
                      {notification.subscription_history.payment_method && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">طريقة الدفع:</span>
                          <span className="font-medium">
                            {notification.subscription_history.payment_method}
                          </span>
                        </div>
                      )}
                      {notification.subscription_history.transaction_id && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">رقم العملية:</span>
                          <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                            {notification.subscription_history.transaction_id}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">نوع الاشتراك:</span>
                    <span className="font-medium">
                      {notification.subscription_history?.subscription_type_name || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">خطة الاشتراك:</span>
                    <span className="font-medium">
                      {notification.subscription_history?.subscription_plan_name || 'غير محددة'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">تاريخ التجديد:</span>
                    <span className="font-medium">
                      {notification.subscription_history?.renewal_date ? formatArabicDate(notification.subscription_history.renewal_date) : 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2">
                    <span className="text-gray-600">تاريخ الانتهاء:</span>
                    <span className="font-medium">
                      {notification.subscription_history?.expiry_date ? formatArabicDate(notification.subscription_history.expiry_date) : 'غير محدد'}
                    </span>
                  </div>

                  {notification.subscription_history?.invite_link ? (
                    <div className="mt-6">
                      <Button
                        className="w-full gap-2 py-6 text-base"
                        onClick={() => window.open(notification.subscription_history?.invite_link || '#', '_blank')}
                      >
                        <LinkIcon className="w-5 h-5" />
                        <span>الانضمام إلى القناة</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
