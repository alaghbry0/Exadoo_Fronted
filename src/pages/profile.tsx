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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24 flex items-center justify-center"
      >
        <div className="text-center text-red-500">
          <p className="mb-4">حدث خطأ أثناء تحميل الاشتراكات</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </motion.div>
    );
  }
  const goToPaymentHistory = () => {
    router.push('/payment-history');
  };


  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
      <AnimatePresence mode="wait">
        <motion.div
          key="profile-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24"
        >
          <ProfileHeader
            fullName={fullName}
            username={telegramUsername}
            profilePhoto={photoUrl}
            joinDate={null}
            onPaymentHistoryClick={goToPaymentHistory}
          />

          <SubscriptionsSection subscriptions={subscriptions || []} />
        </motion.div>
      </AnimatePresence>
    </TonConnectUIProvider>
  );
}