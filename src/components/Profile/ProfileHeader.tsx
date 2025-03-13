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
      className="w-full bg-gradient-to-b from-[#2390f1] to-[#1a75c4] pt-4 pb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 flex flex-col items-center space-y-3">
        {/* صورة الملف الشخصي */}
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="w-20 h-20 rounded-full border-4 border-white/80 shadow-xl overflow-hidden relative">
            <Image
              src={avatarSrc}
              alt={`صورة ${fullName}`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              loading="eager"
              priority
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2390f1]/20 backdrop-blur-[1px]" />
          </div>
        </motion.div>

        {/* معلومات المستخدم */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-lg font-bold text-white drop-shadow-md leading-tight">
            {fullName}
          </h1>

          <div className="flex flex-col items-center text-sm">
            <div className="flex items-center gap-1 text-white/90">
              <FiUser className="text-xs shrink-0" />
              <span className="truncate max-w-[140px]">@{username}</span>
            </div>

            {joinDate && (
              <div className="flex items-center gap-1 text-white/80">
                <FiClock className="text-xs shrink-0" />
                <span>عضو منذ {formattedJoinDate}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
