'use client'
import { useCallback, useEffect, useState } from "react";
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiUser, FiStar, FiZap, FiRefreshCw } from 'react-icons/fi'
import SubscriptionModal from '../components/SubscriptionModal'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTelegram } from "../context/TelegramContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://exadoo.onrender.com";

type UserProfile = {
  telegram_id?: number;
  full_name?: string;
  username?: string | null;
  profile_photo?: string;
  join_date?: string;
  subscriptions?: Subscription[];
};

type Subscription = {
  id: number
  name: string
  price: string
  description: string
  features: string[]
  animation: object
  color: string
  expiry: string
  progress: number
  status: string
}

const defaultUserData: UserProfile = {
  full_name: 'N/L',
  username: 'N/L',
  profile_photo: '/default-profile.png',
  join_date: 'N/L',
  subscriptions: []
}

// مكونات فرعية محسنة
const ProfileHeader = ({ userData }: { userData: UserProfile }) => {
  const [imageSrc, setImageSrc] = useState(
    userData.profile_photo?.startsWith("http") ? userData.profile_photo : "/default-profile.png"
  );

  return (
    <motion.div
      className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto px-4 flex flex-col items-center">
        <motion.div
          className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src={imageSrc}
            alt="Profile"
            width={80}
            height={80}
            className="object-cover rounded-full"
            priority
            onError={() => setImageSrc("/default-profile.png")} // ✅ الحل النهائي
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/20 to-[#2390f1]/20 backdrop-blur-[2px]" />
        </motion.div>

        <motion.div className="mt-3 text-center" initial={{ y: 20 }} animate={{ y: 0 }}>
          <h1 className="text-lg font-bold text-white">{userData.full_name}</h1>
          <p className="text-white/90 mt-1 text-xs flex items-center justify-center gap-1">
            <FiUser className="text-[0.7rem]" />
            {userData.username}
          </p>
          <p className="text-white/80 mt-1 text-xs flex items-center justify-center gap-1">
            <FiClock className="text-[0.7rem]" />
            عضو منذ {userData.join_date}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};



const SubscriptionsSection = ({ subscriptions, handleRenew }: {
  subscriptions: Subscription[]
  handleRenew: (sub: Subscription) => void
}) => (
  <motion.div
    className="container mx-auto px-4 -mt-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-[#eff8ff] p-1.5 rounded-lg">
          <FiZap className="text-lg text-[#2390f1]" />
        </div>
        <h2 className="text-base font-semibold text-[#1a202c]">الاشتراكات النشطة</h2>
      </div>

      {subscriptions.length > 0 ? (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              sub={sub}
              handleRenew={handleRenew}
            />
          ))}
        </div>
      ) : (
        <NoSubscriptionsMessage />
      )}
    </div>
  </motion.div>
)

const SubscriptionItem = ({ sub, handleRenew }: {
  sub: Subscription
  handleRenew: (sub: Subscription) => void
}) => (
  <motion.div
    className="bg-[#f8fbff] rounded-lg p-2 border border-[#eff8ff]"
    whileHover={{ y: -1 }}
  >
    <div className="flex justify-between items-start gap-1.5">
      <div className="flex-1">
        <h3 className="font-medium text-[#1a202c] text-xs">{sub.name}</h3>
        <p className="text-gray-600 text-[0.7rem] mt-0.5">{sub.expiry}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${
          sub.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {sub.status}
        </span>
        <button
          onClick={() => handleRenew(sub)}
          className="p-1 bg-[#2390f1] text-white rounded-md hover:bg-[#1a75c4] transition-colors"
          aria-label="تجديد الاشتراك"
        >
          <FiRefreshCw className="text-xs" />
        </button>
      </div>
    </div>

    <div className="mt-1.5 relative">
      <div className="overflow-hidden h-1 bg-gray-200 rounded-full">
        <div
          className="bg-gradient-to-r from-[#2390f1] to-[#1a75c4] h-full rounded-full"
          style={{ width: `${sub.progress}%` }}
        />
      </div>
    </div>
  </motion.div>
)

const NoSubscriptionsMessage = () => (
  <div className="text-center py-3">
    <div className="inline-block bg-[#eff8ff] p-2 rounded-full mb-1.5">
      <FiStar className="text-lg text-[#2390f1]" />
    </div>
    <p className="text-gray-600 text-xs">لا توجد اشتراكات نشطة حالياً</p>
  </div>
)

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
)

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
)

const Profile: React.FC = () => {
  const { telegramId, setTelegramId } = useTelegram();
  const [userData, setUserData] = useState<UserProfile>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // معالجة تغيير عنوان URL
  useEffect(() => {
    const handleURLChange = () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const newTelegramId = urlParams.get('telegram_id');

      if (newTelegramId !== telegramId?.toString()) {
        console.log(`🔄 تحديث telegramId إلى: ${newTelegramId}`);
        setTelegramId(newTelegramId);
      }
    };

    window.addEventListener('popstate', handleURLChange);
    handleURLChange();

    return () => window.removeEventListener('popstate', handleURLChange);
  }, [telegramId, setTelegramId]);

  // جلب بيانات المستخدم
  const fetchUserData = useCallback(async (controller?: AbortController) => {
    if (!telegramId) {
      console.warn("⚠️ لا يوجد `telegram_id`، سيتم استخدام البيانات الافتراضية.");
      setUserData({ ...defaultUserData, subscriptions: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log(`📡 إرسال طلب إلى: ${BACKEND_URL}/api/user?telegram_id=${telegramId}`);

      const response = await fetch(`${BACKEND_URL}/api/user?telegram_id=${telegramId}`, {
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw new Error(`❌ HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data: UserProfile = await response.json();
      console.log("✅ البيانات المستلمة:", data);

      setUserData({
        ...defaultUserData,
        ...data,
        full_name: data.full_name || defaultUserData.full_name,
        username: data.username ? `@${data.username}` : defaultUserData.username,
        profile_photo: data.profile_photo?.startsWith('http')
          ? data.profile_photo
          : defaultUserData.profile_photo,
        subscriptions: data.subscriptions || [],
      });
    } catch (err: unknown) {
      if (err.name === 'AbortError') {
        console.warn("⏳ تم إلغاء الطلب بسبب إعادة التحميل.");
      } else {
        console.error("❌ خطأ أثناء جلب البيانات:", err);
        setError("حدث خطأ أثناء جلب البيانات");
        setUserData(defaultUserData);
      }
    } finally {
      console.log("✅ تم إنهاء تحميل البيانات.");
      setLoading(false);
    }
  }, [telegramId]);

  useEffect(() => {
    const controller = new AbortController();
    if (telegramId) {
      console.log(`🔄 جلب البيانات لـ telegramId: ${telegramId}`);
      fetchUserData(controller);
    } else {
      console.warn("⚠️ `telegramId` غير موجود، لن يتم جلب البيانات.");
      setLoading(false);
    }

    return () => {
      console.log("🛑 إلغاء الطلب بسبب تغيير `telegramId`.");
      controller.abort();
    };
  }, [telegramId, fetchUserData]);

  const handleRenew = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
        <SkeletonTheme
          baseColor="#f0f0f0"
          highlightColor="#f8f8f8"
          borderRadius="0.5rem"
          duration={1.2}
        >
          <ProfileHeaderSkeleton />
          <SubscriptionsSkeleton />
        </SkeletonTheme>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-24">
      <ProfileHeader userData={userData} />
      <SubscriptionsSection
        subscriptions={userData.subscriptions || []}
        handleRenew={handleRenew}
      />
      <SubscriptionModal
        plan={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  )
}

export default Profile;