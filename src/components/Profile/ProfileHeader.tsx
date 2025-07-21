// ProfileHeader.tsx
import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, FileText, Award, Copy, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// --- دالة مساعدة للتحقق من رابط الصورة ---
export function getValidPhotoUrl(url: string | null, defaultAvatar: string = '/logo.png'): string {
  if (!url) return defaultAvatar;
  try {
    // التحقق من أن الرابط يبدأ بـ https ويتبع بنية صحيحة
    if (url.startsWith('https://')) {
      new URL(url);
      return url;
    }
  } catch (error) {
    console.warn('Invalid photo URL, using default:', url, error);
  }
  return defaultAvatar;
}

interface ProfileHeaderProps {
  fullName?: string | null;
  username?: string | null;
  profilePhoto?: string | null;
  joinDate?: string | null;
  telegramId?: number | string | null;
  onPaymentHistoryClick?: () => void;
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

export default function ProfileHeader({
  fullName = 'مستخدم بدون اسم',
  username = 'بدون معرف',
  profilePhoto,
  joinDate,
  telegramId,
  onPaymentHistoryClick,
}: ProfileHeaderProps) {

    const formattedJoinDate = useMemo(() => {
        if (!joinDate) return 'غير معروف';
        try {
          return new Date(joinDate).toLocaleDateString('ar-EG', DATE_OPTIONS);
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'تاريخ غير صالح';
        }
    }, [joinDate]);

    const avatarSrc = useMemo(
        () => getValidPhotoUrl(profilePhoto ?? null, '/logo.png'),
        [profilePhoto]
    );

  const handleCopyId = async () => {
    if (!telegramId) {
      toast.error('المعرف غير متوفر للنسخ.');
      return;
    }
    try {
      await navigator.clipboard.writeText(telegramId.toString());
      toast.success('تم نسخ المعرف بنجاح!', {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
    } catch (err) {
      console.error('فشل نسخ المعرف:', err);
      toast.error('فشل نسخ المعرف. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    // --- استخدام تدرج لوني حيوي مع نمط بصري خفيف ---
    <div className="w-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-b-3xl shadow-lg overflow-hidden relative font-arabic">
      {/* خلفية بنمط بصري لإضافة عمق */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.07%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 mix-blend-soft-light"></div>

      <div className="relative pt-5 px-4 pb-6">
        {/* أزرار الإجراءات في الأعلى */}
        <div className="flex justify-between items-start">
            {/* إضافة حركة بسيطة للزر مع التحقق من وجود الدالة */}
            {onPaymentHistoryClick && (
              <motion.button
                onClick={onPaymentHistoryClick}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white/20 active:scale-95 touch-manipulation"
                title="سجلات الدفعات"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.button>
            )}
            {/* عنصر نائب للحفاظ على التنسيق إذا لم يكن الزر موجودًا */}
            {!onPaymentHistoryClick && <div />}

            <motion.div
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md"
              title="الإنجازات (قريباً)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Award className="w-5 h-5 text-white/80" />
            </motion.div>
        </div>

        {/* معلومات المستخدم الأساسية */}
        <div className="mt-2 text-center">
            {/* إضافة خلفية متدرجة للصورة الشخصية لجذب الانتباه */}
            <div className="relative inline-block p-1 bg-gradient-to-tr from-white/30 to-white/10 rounded-full">
              <div className={cn(
                "w-24 h-24 rounded-full border-2 border-white/50 shadow-lg overflow-hidden",
                "bg-primary-300" // لون احتياطي في حال عدم تحميل الصورة
              )}>
                <Image
                  src={avatarSrc}
                  alt={`صورة ${fullName || 'المستخدم'}`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  priority
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {fullName || 'مستخدم'}
              </h1>
              <p className="text-primary-200">@{username || 'غير محدد'}</p>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center gap-3">
              {telegramId && (
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/30 transition-colors group cursor-pointer active:scale-95"
                  title="اضغط لنسخ المعرف"
                >
                  <span className="text-white/80 text-sm font-mono tracking-wider">
                    ID: {telegramId}
                  </span>
                  <Copy className="w-4 h-4 text-primary-200 group-hover:text-white transition-colors" />
                </button>
              )}
              {joinDate && (
                <div className="flex items-center gap-1.5 text-white/70 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>عضو منذ {formattedJoinDate}</span>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}