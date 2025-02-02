'use client'
import { useEffect, useState } from "react";
import { useTelegram } from "../context/TelegramContext";
import SubscriptionModal from '../components/SubscriptionModal';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import useSWR from 'swr';
import { UserProfile, Subscription } from '@/types'; // ✅ استيراد الأنواع الموحدة

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://exadoo.onrender.com";
const DEFAULT_PROFILE = '/default-profile.png';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Profile() {
  const { telegramId, setTelegramId } = useTelegram();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const { data, error, isLoading } = useSWR<UserProfile>(
    telegramId ? `${BACKEND_URL}/api/user?telegram_id=${telegramId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 10000,
    }
  );

  // معالجة تغيير عنوان URL
    useEffect(() => {
    const handleURLChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const newTelegramId = urlParams.get('telegram_id');

        // ✅ تحقق من القيمة قبل التحديث
        if (newTelegramId && newTelegramId !== telegramId) {
        setTelegramId(newTelegramId);
        }
    };

    window.addEventListener('popstate', handleURLChange);
    handleURLChange();

    return () => window.removeEventListener('popstate', handleURLChange);
    }, [telegramId, setTelegramId]);

  const handleRenew = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
        <SkeletonTheme baseColor="#f0f0f0" highlightColor="#f8f8f8" borderRadius="0.5rem" duration={1.2}>
          <ProfileHeaderSkeleton />
          <SubscriptionsSkeleton />
        </SkeletonTheme>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-4">حدث خطأ أثناء جلب البيانات</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const userData = data ? {
    ...data,
    full_name: data.full_name || 'N/L',
    username: data.username ? `${data.username}` : 'N/L',
    profile_photo: data.profile_photo?.startsWith('http') ? data.profile_photo : DEFAULT_PROFILE,
    subscriptions: data.subscriptions || [],
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
      {userData && (
        <>
          <ProfileHeader userData={userData} />
          <SubscriptionsSection
            subscriptions={userData.subscriptions}
            handleRenew={handleRenew}
          />
        </>
      )}
      <SubscriptionModal
        plan={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  );
}

const ProfileHeaderSkeleton = () => (
  <SkeletonTheme baseColor="#e3e3e3" highlightColor="#f0f0f0">
    <div className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-4 pb-8">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Skeleton circle width={80} height={80} className="mb-4" />
        <Skeleton width={150} height={20} className="mb-2" />
        <Skeleton width={120} height={16} />
        <Skeleton width={140} height={16} className="mt-1" />
      </div>
    </div>
  </SkeletonTheme>
);

const SubscriptionsSkeleton = () => (
  <SkeletonTheme baseColor="#f0f0f0" highlightColor="#f8f8f8">
    <div className="container mx-auto px-4 -mt-6">
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton circle width={30} height={30} />
          <Skeleton width={140} height={20} />
        </div>
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} height={80} className="mb-3 rounded-lg" />
        ))}
      </div>
    </div>
  </SkeletonTheme>
);
