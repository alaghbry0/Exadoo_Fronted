'use client'
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useUserStore } from "../stores/zustand/userStore";
import { useProfileStore } from '../stores/profileStore';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Spinner } from '../components/Spinner'
import { getUserSubscriptions } from '../services/api';

export default function Profile() {
  // استخراج معلومات المستخدم من الـ store
  // نستخدم أسماء camelCase للمكونات بينما تبقى تعريفات الـ API في snake_case
  const { fullName, telegramUsername, photoUrl, telegramId } = useUserStore();
  const { subscriptions, error, setSubscriptions, setError } = useProfileStore();

  // استخدام React Query لجلب الاشتراكات مع منطق كاش مدمج (مدة صلاحية الكاش 5 دقائق)
  const { isLoading, isError, refetch } = useQuery(
    ['subscriptions', telegramId],
    () => {
      if (!telegramId) throw new Error('المعرف غير موجود');
      return getUserSubscriptions(telegramId);
    },
    {
      enabled: !!telegramId,
      staleTime: 300000, // 5 دقائق
      onSuccess: (data) => {
        // حفظ البيانات في localStorage لتقليل استدعاءات الـ API
        localStorage.setItem('subscriptions', JSON.stringify({
          data: data.subscriptions,
          timestamp: Date.now()
        }));
        setSubscriptions(data.subscriptions);
      },
      onError: (err: Error) => setError(err.message)
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    // بدلاً من إعادة تحميل الصفحة، يتم استخدام refetch لإعادة محاولة جلب البيانات
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24 flex items-center justify-center"
      >
        <div className="text-center text-red-500">
          <p className="mb-4">{error}</p>
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
          {/*
            تحويل بيانات الـ API (snake_case) إلى أسماء متوافقة مع المكونات (camelCase):
            نستخدم telegramUsername كـ username، ويتم تمرير باقي البيانات وفقاً لذلك.
            إذا كانت خاصية joinDate غير متوفرة نقوم بتمرير null.
          */}
          <ProfileHeader
            fullName={fullName}
            username={telegramUsername}
            profilePhoto={photoUrl}
            joinDate={null}
          />

          <SubscriptionsSection
            subscriptions={subscriptions || []}
          />
        </motion.div>
      </AnimatePresence>
    </TonConnectUIProvider>
  );
}
