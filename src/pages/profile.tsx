'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useUserStore } from "../stores/zustand/userStore";
import { useProfileStore } from '../stores/profileStore';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { getUserSubscriptions } from '../services/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { fullName, telegramUsername, photoUrl, telegramId } = useUserStore();
  const { subscriptions, setSubscriptions } = useProfileStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    queryFn: async () => {
      if (!telegramId) throw new Error('المعرف غير موجود');
      return await getUserSubscriptions(telegramId.toString());
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ? lastPage.nextPage : undefined,
    enabled: !!telegramId,
    staleTime: 300000, // 5 دقائق
  });

  useEffect(() => {
    if (data) {
      const allSubscriptions = data.pages.flatMap(page => page.subscriptions);
      localStorage.setItem(
        'subscriptions',
        JSON.stringify({
          data: allSubscriptions,
          timestamp: Date.now()
        })
      );
      setSubscriptions(allSubscriptions);
    }
  }, [data, setSubscriptions]);

  const goToPaymentHistory = () => {
    router.push('/payment-history');
  };

  const handleRefresh = async () => {
    if (!telegramId) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('فشل تحديث البيانات:', error);
      toast.error('فشل تحديث البيانات، يرجى المحاولة مرة أخرى', {
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <SkeletonLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white safe-area-padding pb-24 flex items-center justify-center p-4"
      >
        <div className="text-center p-6 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm border border-gray-100 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">حدث خطأ</h2>
          <p className="mb-6 text-gray-600 text-base">فشل في تحميل الاشتراكات، يرجى المحاولة مرة أخرى</p>
          <button
            onClick={() => refetch()}
            className="px-8 py-4 bg-app-blue-500 text-white rounded-xl hover:bg-app-blue-600 transition-colors text-base shadow-md hover:shadow-lg active:scale-95 transition-transform"
          >
            إعادة المحاولة
          </button>
        </div>
      </motion.div>
    );
  }

  const loadMoreHandler = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
      <AnimatePresence mode="wait">
        <motion.div
          key="profile-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="min-h-screen bg-gradient-to-b from-gray-50 to-white safe-area-padding pb-28"
        >
          <ProfileHeader
            fullName={fullName}
            username={telegramUsername}
            profilePhoto={photoUrl}
            joinDate={null} // يمكنك تمرير تاريخ الانضمام الفعلي إذا كان متاحًا
            telegramId={telegramId} // ⭐ تمرير معرف تيليجرام
            onPaymentHistoryClick={goToPaymentHistory}
            onRefreshData={handleRefresh} // ⭐ تمرير دالة التحديث للهيدر
            isRefreshing={isRefreshing} // ⭐ تمرير حالة التحديث للهيدر
          />
          <div className="px-4 pt-2">
            <SubscriptionsSection
              subscriptions={subscriptions || []}
              loadMore={loadMoreHandler}
              hasMore={!!hasNextPage}
              isLoadingMore={isFetchingNextPage}
              onRefreshClick={handleRefresh} // زر التحديث هنا أيضًا (يمكنك اختيار الإبقاء على واحد فقط)
              isRefreshing={isRefreshing}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </TonConnectUIProvider>
  );
}