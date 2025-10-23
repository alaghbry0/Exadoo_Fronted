// src/pages/Profile.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useUserStore } from "../stores/zustand/userStore";
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { getUserSubscriptions } from '../services/api';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { fullName, telegramUsername, photoUrl, telegramId, subscriptions, setSubscriptions } = useUserStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- منطق جلب البيانات (لا تغيير هنا) ---
  const queryKey = ['subscriptions', telegramId?.toString() || ''];
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!telegramId) throw new Error('المعرف غير موجود');
      return await getUserSubscriptions(telegramId.toString(), pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ? lastPage.nextPage : undefined,
    enabled: !!telegramId,
    staleTime: 300000, // 5 دقائق
  });

  useEffect(() => {
    if (data) {
      const allSubscriptions = data.pages.flatMap(page => page.subscriptions);
      setSubscriptions(allSubscriptions);
    }
  }, [data, setSubscriptions]);

  const goToPaymentHistory = () => router.push('/payment-history');

  const handleRefresh = async () => {
    if (!telegramId) return;
    setIsRefreshing(true);
    try {
      await refetch();
      // يمكنك إضافة رسالة نجاح هنا إذا أردت
      // toast.success('تم تحديث البيانات بنجاح');
    } catch {
      toast.error('فشل تحديث البيانات، يرجى المحاولة مرة أخرى');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreHandler = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // --- شاشة تحميل جديدة وأكثر جاذبية ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <p className="mt-4 text-gray-600 font-semibold font-arabic">جارٍ تحميل ملفك الشخصي...</p>
      </div>
    );
  }

  // --- شاشة خطأ محسّنة ---
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700 pt-2 font-arabic">حدث خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 font-arabic">فشل تحميل بياناتك. يرجى المحاولة مرة أخرى.</p>
            <Button onClick={() => refetch()} size="lg" className="font-arabic">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- العرض النهائي للصفحة مع كل التحسينات ---
  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'font-arabic', // تطبيق الخط العربي على كل التنبيهات
          success: { duration: 3000 },
          error: { duration: 4000 },
      }}/>
      <motion.div
        key="profile-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        // استخدام خلفية وخط متناسقين
        className="min-h-screen bg-gray-50 text-gray-800 font-arabic pb-12"
      >
        <ProfileHeader
          fullName={fullName}
          username={telegramUsername}
          profilePhoto={photoUrl}
          telegramId={telegramId}
          onPaymentHistoryClick={goToPaymentHistory}
        />
        {/* إضافة تباعد أفضل للمحتوى الرئيسي */}
        <div className="px-4 md:px-6 py-8 max-w-4xl mx-auto ">
          <SubscriptionsSection
            subscriptions={subscriptions || []}
            loadMore={loadMoreHandler}
            hasMore={!!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            isRefreshing={isRefreshing}
            onRefreshClick={handleRefresh}
          />
        </div>
      </motion.div>
    </TonConnectUIProvider>
  );
}