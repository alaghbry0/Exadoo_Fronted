'use client'
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiClock, FiUser } from 'react-icons/fi';
import { useMemo } from 'react';

/**
 * دالة مساعدة للتحقق من صلاحية رابط الصورة.
 * إذا كان الرابط صحيحاً يبدأ بـ "https://"، يتم إرجاعه، وإلا يتم إرجاع الصورة الافتراضية.
 */
export function getValidPhotoUrl(url: string | null, defaultAvatar: string): string {
  if (!url) return defaultAvatar;
  try {
    if (url.startsWith('https://')) {
      new URL(url); // التحقق من صحة الرابط
      return url;
    }
  } catch (error) {
    console.error('Invalid photo URL:', error);
  }
  return defaultAvatar;
}

interface ProfileHeaderProps {
  fullName?: string | null;
  username?: string | null;
  profilePhoto?: string | null;
  joinDate?: string | null;
}

const DEFAULT_AVATAR = '/logo-288.png';

// إعدادات تنسيق التاريخ لعرض تاريخ الانضمام
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

export default function ProfileHeader({
  fullName = 'مستخدم بدون اسم',
  username = 'بدون معرف',
  profilePhoto,
  joinDate
}: ProfileHeaderProps) {

  // استخدام useMemo لتنسيق التاريخ لتقليل الحسابات غير الضرورية
  const formattedJoinDate = useMemo(() => {
    if (!joinDate) return 'غير معروف';
    try {
      return new Date(joinDate).toLocaleDateString('ar-EG', DATE_OPTIONS);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  }, [joinDate]);

  // استخدام الدالة المساعدة للتحقق من صلاحية رابط الصورة
  const avatarSrc = useMemo(() => getValidPhotoUrl(profilePhoto ?? null, DEFAULT_AVATAR), [profilePhoto]);

  return (
    <motion.div
  className="w-full bg-gradient-to-b from-blue-600 to-blue-400 pt-8 pb-6 md:pt-12 md:pb-10"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1],
    delay: 0.2 // تأخير ظهور الهيدر
  }}
>
      <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
        {/* صورة الملف الشخصي مع تحسينات الاستجابة */}
        <motion.div
          className="relative group ring-4 ring-white/20 ring-offset-2 ring-offset-blue-100 rounded-full"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden relative">
            <Image
              src={avatarSrc}
              alt={`صورة ${fullName}`}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              loading="eager"
              priority
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-800/20 backdrop-blur-[2px]" />
          </div>
        </motion.div>

        {/* معلومات المستخدم مع تحسينات الطباعة */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md leading-tight">
            {fullName}
          </h1>

          <div className="flex flex-col items-center text-sm md:text-base">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <FiUser className="text-white/80 shrink-0" />
              <span className="text-white/90 truncate max-w-[160px] md:max-w-[240px]">
                @{username}
              </span>
            </div>

            {joinDate && (
              <div className="flex items-center gap-2 text-white/80 mt-2">
                <FiClock className="shrink-0" />
                <span className="text-sm">عضو منذ {formattedJoinDate}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
