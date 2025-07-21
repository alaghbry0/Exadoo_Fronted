// pages/notifications/[id].tsx (النسخة النهائية)

'use client';
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
  CreditCard,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/context/TelegramContext';
import { useNotificationsContext } from '@/context/NotificationsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/types/notification';

// استيراد المكونات الجديدة
import PaymentDetailsCard from '@/components/details/PaymentDetailsCard';
import SubscriptionDetailsCard from '@/components/details/SubscriptionDetailsCard';


// --- الدوال المساعدة ومكونات الواجهة (تبقى كما هي) ---

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

  const enabled = !!telegramId && !!notificationId;

  const {
    data: notification,
    isLoading,
    isError,
  } = useQuery<NotificationType>({
    queryKey: ['notification', notificationId, telegramId],
    queryFn: async () => {
      if (!enabled) throw new Error('المعرفات المطلوبة غير متوفرة');

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/${notificationId}`,
        { params: { telegram_id: telegramId } }
      );

      if (data.extra_data && typeof data.extra_data === 'string') {
        try {
          data.extra_data = JSON.parse(data.extra_data);
        } catch (e) {
          console.error("Failed to parse extra_data JSON:", e);
          data.extra_data = {};
        }
      }
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (notification && !notification.read_status) {
      markAsRead(notification.id);
      queryClient.setQueryData<NotificationType>(
        ['notification', notificationId, telegramId],
        (oldData) => (oldData ? { ...oldData, read_status: true } : undefined)
      );
    }
  }, [notification, markAsRead, queryClient, notificationId, telegramId]);

  // --- بقية الدوال المساعدة (تبقى كما هي) ---
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'غير معروف';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ar });
  };

  const getNotificationIcon = () => {
    if (!notification?.type) return <Bell className="w-8 h-8 text-blue-600" />;
    switch (notification.type) {
      case 'subscription_renewal':
      case 'subscription_update':
        return <Calendar className="w-8 h-8 text-blue-500" />;
      case 'payment_success':
        return <CreditCard className="w-8 h-8 text-emerald-600" />;
      case 'payment_warning':
        return <AlertTriangle className="w-8 h-8 text-amber-600" />;
      case 'payment_failed':
        return <AlertOctagon className="w-8 h-8 text-red-600" />;
      case 'subscription_expiry':
        return <Clock className="w-8 h-8 text-amber-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-blue-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!notification?.extra_data?.severity) return null;
    const { severity } = notification.extra_data;
    let classes = "px-2 py-1 text-xs font-medium rounded-full ";
    let label = "";
    switch (severity) {
      case 'success': classes += "bg-emerald-100 text-emerald-800"; label = "ناجح"; break;
      case 'warning': classes += "bg-amber-100 text-amber-800"; label = "تحذير"; break;
      case 'error': classes += "bg-red-100 text-red-800"; label = "فشل"; break;
      case 'info': classes += "bg-blue-100 text-blue-800"; label = "معلومات"; break;
      default: return null;
    }
    return <span className={classes}>{label}</span>;
  };

  const handleGoBack = () => router.back();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] space-y-6">
        {/* Skeleton UI */}
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        {/* Error UI */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen relative z-20">
      <div className="flex items-center mb-6 sticky top-0 bg-gray-50 z-30 py-2">
        <Button onClick={handleGoBack} variant="outline" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold flex-1 text-center">تفاصيل الإشعار</h1>
        <div className="w-10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 space-y-6 pb-12"
      >
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                {getNotificationIcon()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                      {notification.title || 'إشعار بدون عنوان'}
                    </h2>
                    {getStatusBadge()}
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {getRelativeTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {notification.message || 'لا يوجد محتوى للإشعار'}
                </p>
                <div className="text-sm text-gray-500">
                  {formatArabicDate(notification.created_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* عرض تفاصيل الدفع */}
        {(notification.type === 'payment_success' || notification.type === 'payment_warning' || notification.type === 'payment_failed') && notification.extra_data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <PaymentDetailsCard
              extraData={{
                ...notification.extra_data,
                amount: notification.extra_data.amount?.toString(),
                expected_amount: notification.extra_data.expected_amount?.toString(),
                difference: notification.extra_data.difference?.toString(),
              }}
              type={notification.type}
            />
          </motion.div>
        )}

        {/* عرض تفاصيل تحديث الاشتراك */}
        {(notification.type === 'subscription_update' || notification.type === 'subscription_renewal') && notification.extra_data && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SubscriptionDetailsCard extraData={notification.extra_data} />
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
