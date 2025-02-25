'use client'
import React from 'react';
import { useUserStore } from "../stores/zustand/userStore";
import { useProfileStore } from '../stores/profileStore';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function Profile() {
  const { telegramUsername, fullName, photoUrl } = useUserStore();
  const { userProfile, userSubscriptions } = useProfileStore();

  const userData = userProfile;
  const subscriptionsData = userSubscriptions;

  console.log("Profile.tsx: قيمة photoUrl من userStore:", photoUrl);

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
        <SkeletonTheme baseColor="#f0f0f0" highlightColor="#f8f8f8" borderRadius="0.5rem" duration={1.2}>
          <ProfileHeaderSkeleton />
          <SubscriptionsSkeleton />
        </SkeletonTheme>
      </div>
    );
  }

  if (!subscriptionsData && userData === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-4">حدث خطأ أثناء جلب بيانات الاشتراك</p>
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

  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
        {userData && (
          <>
            <ProfileHeader
              fullName={fullName}
              username={telegramUsername}
              profile_photo={photoUrl}
              joinDate={userData.join_date}
            />
            <SubscriptionsSection
              subscriptions={subscriptionsData || []}
              // لا تمرر دالة التجديد حتى لا يظهر زر التجديد
            />
          </>
        )}
        {/* تمت إزالة SubscriptionModal لعدم الحاجة لتجديد الاشتراك حالياً */}
      </div>
    </TonConnectUIProvider>
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
