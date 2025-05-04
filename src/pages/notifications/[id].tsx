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
  AlertCircle,
  MessageSquare,
  AlertTriangle,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/context/TelegramContext';
import { useNotificationsContext } from '@/context/NotificationsContext';

// مكونات الواجهة الخاصة بالبطاقة والأزرار
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/types/notification';
import { Badge } from '@/components/ui/badge';

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
      case 'payment_warning':
        return <AlertTriangle className="w-8 h-8 text-amber-600" />;
      case 'payment_failed':
        return <AlertOctagon className="w-8 h-8 text-red-600" />;
      case 'subscription_expiry':
        return <Clock className="w-8 h-8 text-amber-600" />;
      case 'system_notification':
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
      default:
        return <Bell className="w-8 h-8 text-blue-600" />;
    }
  };

  // تحديد لون وخلفية الإشعار بناءً على نوعه
  const getNotificationTheme = () => {
    if (!notification?.type) {
      return {
        bg: 'bg-blue-50',
        title: 'text-blue-800',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      };
    }
    
    switch (notification.type) {
      case 'subscription_renewal':
        return {
          bg: 'bg-emerald-50',
          title: 'text-emerald-800',
          icon: 'text-emerald-600',
          border: 'border-emerald-200'
        };
      case 'payment_success':
        return {
          bg: 'bg-emerald-50',
          title: 'text-emerald-800',
          icon: 'text-emerald-600',
          border: 'border-emerald-200'
        };
      case 'payment_warning':
        return {
          bg: 'bg-amber-50',
          title: 'text-amber-800',
          icon: 'text-amber-600',
          border: 'border-amber-200'
        };
      case 'payment_failed':
        return {
          bg: 'bg-red-50',
          title: 'text-red-800',
          icon: 'text-red-600',
          border: 'border-red-200'
        };
      case 'subscription_expiry':
        return {
          bg: 'bg-amber-50',
          title: 'text-amber-800',
          icon: 'text-amber-600',
          border: 'border-amber-200'
        };
      default:
        return {
          bg: 'bg-blue-50',
          title: 'text-blue-800',
          icon: 'text-blue-600',
          border: 'border-blue-200'
        };
    }
  };

  // الحصول على شارة حالة الإشعار
  const getStatusBadge = () => {
    if (!notification?.extra_data?.severity) return null;
    
    const severity = notification.extra_data.severity;
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    let label = "";
    
    switch (severity) {
      case 'success':
        classes += "bg-emerald-100 text-emerald-800";
        label = "ناجح";
        break;
      case 'warning':
        classes += "bg-amber-100 text-amber-800";
        label = "تحذير";
        break;
      case 'error':
        classes += "bg-red-100 text-red-800";
        label = "فشل";
        break;
      case 'info':
        classes += "bg-blue-100 text-blue-800";
        label = "معلومات";
        break;
      default:
        classes += "bg-gray-100 text-gray-800";
        label = severity;
    }
    
    return <span className={classes}>{label}</span>;
  };

  const handleGoBack = () => {
    router.back();
  };

  // حالة عدم توفر المعطيات الأساسية
  if (!notificationId || !telegramId) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center ">
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
      <div className="container mx-auto p-4 min-h-[60vh] space-y-6">
        {/* هيكل Skeleton للرأس */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
        
        {/* هيكل Skeleton للبطاقة الرئيسية */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>

        {/* هيكل Skeleton لبطاقة تفاصيل الدفع */}
        <div className="p-6 bg-white rounded-lg shadow space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
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
          className="bg-red-50 p-6 rounded-lg text-center max-w-md w-full "
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

  const theme = getNotificationTheme();

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen relative z-20">
      {/* رأس الصفحة مع z-index أعلى */}
      <div className="flex items-center mb-6 sticky top-0 bg-gray-50 z-30 py-2">
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
      
      {/* باقي المحتوى */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-20"
      >
        {/* بطاقة تفاصيل الإشعار */}
        <Card className={`mb-6 ${theme.border}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 ${theme.bg} rounded-full`}>
                {getNotificationIcon()}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-semibold mb-2 ${theme.title}`}>
                      {notification?.title || notification?.type?.replace(/_/g, ' ') || 'إشعار بدون عنوان'}
                    </h2>
                    {getStatusBadge()}
                  </div>
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

        {/* بطاقة تفاصيل الدفع (للإشعارات المتعلقة بالدفع) */}
        {(notification.type === 'payment_warning' || notification.type === 'payment_failed' || notification.type === 'payment_success') && 
         notification.extra_data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className={`mb-6 ${theme.border}`}>
              <CardHeader>
                <CardTitle className={`text-lg font-semibold pb-2 border-b border-gray-200 ${theme.title}`}>
                  {notification.type === 'payment_success' && "تفاصيل الدفع الناجح"}
                  {notification.type === 'payment_warning' && "تحذير متعلق بالدفع"}
                  {notification.type === 'payment_failed' && "فشل عملية الدفع"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`${theme.bg} p-4 rounded-lg mb-4`}>
                  <div className="space-y-3">
                    {notification.extra_data.payment_id && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">معرف عملية الدفع:</span>
                        <span className="font-medium bg-white px-2 py-1 rounded text-sm break-all">
                          {notification.extra_data.payment_id}
                        </span>
                      </div>
                    )}
                    
                    {notification.extra_data.amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">المبلغ المدفوع:</span>
                        <span className={`font-bold ${
                          notification.type === 'payment_failed' ? 'text-red-600' : 
                          notification.type === 'payment_warning' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {notification.extra_data.amount} TON
                        </span>
                      </div>
                    )}
                    
                    {notification.extra_data.expected_amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">المبلغ المطلوب:</span>
                        <span className="font-medium">
                          {notification.extra_data.expected_amount} TON
                        </span>
                      </div>
                    )}
                    
                    {notification.extra_data.difference && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {notification.type === 'payment_warning' ? 'الزيادة في المبلغ:' : 'النقص في المبلغ:'}
                        </span>
                        <span className={`font-medium ${
                          notification.type === 'payment_failed' ? 'text-red-600' : 
                          notification.type === 'payment_warning' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {notification.extra_data.difference} TON
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ملاحظات مهمة */}
                {notification.extra_data.message && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    notification.type === 'payment_failed' ? 'bg-red-50 border border-red-200' : 
                    notification.type === 'payment_warning' ? 'bg-amber-50 border border-amber-200' : 
                    'bg-emerald-50 border border-emerald-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      notification.type === 'payment_failed' ? 'text-red-700' : 
                      notification.type === 'payment_warning' ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      ملاحظة مهمة
                    </h4>
                    <p className="text-gray-700">{notification.extra_data.message}</p>
                  </div>
                )}
                
                {/* زر التواصل مع الدعم */}
                {notification.extra_data.invite_link && (
                  <div className="mt-4">
                    <Button
                      className={`w-full gap-2 py-6 text-base ${
                        notification.type === 'payment_failed' ? 'bg-red-600 hover:bg-red-700' : 
                        notification.type === 'payment_warning' ? 'bg-amber-600 hover:bg-amber-700' : 
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={() => window.open(notification.extra_data?.invite_link || '#', '_blank')}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>التواصل مع فريق الدعم</span>
                      <ExternalLink className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* بطاقة تفاصيل الاشتراك (إن وُجدت) */}
        {notification.subscription_history && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold pb-2 border-b border-gray-200">
                  تفاصيل الاشتراك
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