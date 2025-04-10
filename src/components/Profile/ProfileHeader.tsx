import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, FileText, Award } from 'lucide-react';
import { cn } from '@/lib/utils'; // تأكد من وجود الدالة أو استبدلها بتجميع السلاسل العادية

/**
 * دالة مساعدة للتحقق من صلاحية رابط الصورة.
 * إذا كان الرابط صحيحاً يبدأ بـ "https://"، يتم إرجاعه،
 * وإلا يتم إرجاع الصورة الافتراضية ('/logo-288.png').
 */
export function getValidPhotoUrl(url: string | null, defaultAvatar: string = '/logo-288.png'): string {
  if (!url) return defaultAvatar;
  try {
    if (url.startsWith('https://')) {
      new URL(url);
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
  onPaymentHistoryClick?: () => void;
}

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
  joinDate,
  onPaymentHistoryClick,
}: ProfileHeaderProps) {
  // تنسيق التاريخ باستخدام useMemo لتقليل العمليات الحسابية
  const formattedJoinDate = useMemo(() => {
    if (!joinDate) return 'غير معروف';
    try {
      return new Date(joinDate).toLocaleDateString('ar-EG', DATE_OPTIONS);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  }, [joinDate]);

  // التحقق من صلاحية رابط الصورة واستخدام الصورة الافتراضية '/logo-288.png' في حال عدم صحتها
  const avatarSrc = useMemo(
    () => getValidPhotoUrl(profilePhoto ?? null, '/logo-288.png'),
    [profilePhoto]
  );

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-b-3xl shadow-md overflow-hidden relative">
      {/* خلفية تدرجية رمزية */}
      <div className="h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMCI+PC9yZWN0Pgo8cGF0aCBkPSJNMjggNjZMMCA1MEwwIDMzTDI4IDE3TDU2IDMzTDU2IDUwTDI4IDY2TDI4IDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA2M0wyOCA3OUw1NiA2M0w1NiA1MEwyOCAzNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-15" />

      {/* زر سجل الدفعات (إن وُجد) */}
      {onPaymentHistoryClick && (
        <motion.button
          onClick={onPaymentHistoryClick}
          className="absolute top-4 left-4 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white/20 active:scale-95"
          title="سجلات الدفعات"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          aria-label="عرض سجل الدفعات"
        >
          <FileText className="w-5 h-5 text-white" />
        </motion.button>
      )}

      {/* أيقونة الجوائز (الإنجازات) */}
      <motion.div
        className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md"
        title="الإنجازات"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Award className="w-5 h-5 text-white" />
      </motion.div>

      <div className="px-4 pb-6 -mt-8">
        {/* صورة الملف الشخصي */}
        <div className="relative flex justify-center">
          <div className="relative">
            <div className={cn(
              "w-20 h-20 rounded-full",
              "border-4 border-white shadow-lg overflow-hidden",
              "bg-white"
            )}>
              <img
                src={avatarSrc}
                alt={`صورة ${fullName}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-288.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* معلومات المستخدم */}
        <div className="mt-3 text-center space-y-2">
          <h1 className="text-lg font-bold text-white text-shadow-sm">
            {fullName}
          </h1>
          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
              <User className="w-3.5 h-3.5 text-blue-100" />
              <span className="text-white/90 truncate max-w-[180px] text-xs">
                @{username}
              </span>
            </div>
            {joinDate && (
              <div className="flex items-center gap-1 text-white/80">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  عضو منذ {formattedJoinDate}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
