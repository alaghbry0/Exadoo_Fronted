//-profile.tsx
'use client'
import React, { useState } from 'react'; // ✅ إضافة استيراد useState من React هنا
import { useUserStore } from "../stores/zustand/userStore"; // ✅ Import useUserStore
import SubscriptionModal from '../components/SubscriptionModal';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProfileHeader from '../components/Profile/ProfileHeader';
import SubscriptionsSection from '../components/Profile/SubscriptionsSection';
import useSWR from 'swr';
import { UserProfile, Subscription } from '@/types';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://exadoo.onrender.com";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Profile() {
    const { telegramId, telegramUsername, fullName, photoUrl } = useUserStore(); // ✅ Get user data from useUserStore
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    // ✅ تحميل بيانات الاشتراكات من الخادم الخلفي فقط باستخدام useSWR
    const { data: subscriptionsData, error, isLoading } = useSWR<UserProfile>(
        telegramId ? `${BACKEND_URL}/api/user?telegram_id=${telegramId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            shouldRetryOnError: false,
        }
    );

    // ✅ دمج بيانات المستخدم والاشتراكات (سيتم توفير userData لاحقًا من TelegramProfileLoader)
    const userData = subscriptionsData as UserProfile;

    const handleRenew = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
    };

    if (isLoading) { // ✅ Keep isLoading for subscriptionsData loading, if needed
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
                <SkeletonTheme baseColor="#f0f0f0" highlightColor="#f8f8f8" borderRadius="0.5rem" duration={1.2}>
                    <ProfileHeaderSkeleton />
                    <SubscriptionsSkeleton />
                </SkeletonTheme>
            </div>
        );
    }

    if (error) { // ✅ Keep error for subscriptionsData loading error, if needed
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
                {/* <TelegramProfileLoader /> */}  {/* ✅ Remove TelegramProfileLoader component */}
                {userData && (
                    <>
                        <ProfileHeader
                             fullName={fullName}
                             username={telegramUsername}
                             profile_photo={photoUrl}
                             joinDate={userData.join_date} // ✅ تغيير joinDate إلى join_date هنا
                        />
                        <SubscriptionsSection
                            subscriptions={userData.subscriptions || []} // ✅ Keep subscriptions section as is
                            handleRenew={handleRenew}
                        />
                    </>
                )}
                {/* ✅ Wrap SubscriptionModal in a React.Fragment */}
                <React.Fragment>
                    <SubscriptionModal
                        plan={selectedSubscription}
                        onClose={() => setSelectedSubscription(null)}
                    />
                </React.Fragment>
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