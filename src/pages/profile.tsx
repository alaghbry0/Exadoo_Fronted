// 1-profile.tsx المحسن

'use client'
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from "../stores/zustand/userStore";
import { useProfileStore } from '../stores/profileStore';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Spinner } from '../components/Spinner';
import { getUserSubscriptions } from '../services/api';
import type { Subscription } from '../types';
import { useRouter } from 'next/navigation';

interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

export default function Profile() {
  const { fullName, telegramUsername, photoUrl, telegramId } = useUserStore();
  const { subscriptions, setSubscriptions } = useProfileStore();
  const router = useRouter();

  const queryKey = ['subscriptions', telegramId?.toString() || ''];

  const { data, isLoading, isError, refetch } = useQuery<SubscriptionsResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!telegramId) throw new Error('المعرف غير موجود');
      return await getUserSubscriptions(telegramId.toString());
    },
    enabled: !!telegramId,
    staleTime: 300000,
  });

  useEffect(() => {
    if (data?.subscriptions) {
      localStorage.setItem(
        'subscriptions',
        JSON.stringify({
          data: data.subscriptions,
          timestamp: Date.now()
        })
      );
      setSubscriptions(data.subscriptions);
    }
  }, [data, setSubscriptions]);

  const goToPaymentHistory = () => {
    router.push('/payment-history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Spinner className="w-10 h-10" /> {/* تكبير الـ Spinner */}
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
            joinDate={null}
            onPaymentHistoryClick={goToPaymentHistory}
          />
          <div className="px-4 pt-2"> {/* إضافة padding لمزيد من المساحة */}
            <SubscriptionsSection subscriptions={subscriptions || []} />
          </div>
        </motion.div>
      </AnimatePresence>
    </TonConnectUIProvider>
  );
}