import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, User, FileText, Award, Copy, CheckCircle } from 'lucide-react'; // ⭐ إزالة RefreshCw
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

/**
 * دالة مساعدة للتحقق من صلاحية رابط الصورة.
 */
export function getValidPhotoUrl(url: string | null, defaultAvatar: string = '/logo-288.png'): string {
  if (!url) return defaultAvatar;
  try {
    if (url.startsWith('https://')) {
      new URL(url); // مجرد محاولة لإنشاء URL للتحقق من الصحة
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
  // onRefreshData?: () => void; // ⭐ تمت إزالته
  // isRefreshing?: boolean; // ⭐ تمت إزالته
}

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
  telegramId,
  onPaymentHistoryClick,
  // onRefreshData, // ⭐ تمت إزالته
  // isRefreshing = false, // ⭐ تمت إزالته
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
    () => getValidPhotoUrl(profilePhoto ?? null, '/logo-288.png'),
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
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-b-3xl shadow-lg overflow-hidden relative">
      <div className="absolute inset-0 h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMCI+PC9yZWN0Pgo8cGF0aCBkPSJNMjggNjZMMCA1MEwwIDMzTDI4IDE3TDU2IDMzTDU2IDUwTDI4IDY2TDI4IDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA2M0wyOCA3OUw1NiA2M0w1NiA1MEwyOCAzNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-15 pointer-events-none" />

      <div className="relative pt-5 px-4">
        <div className="flex justify-between items-start">
          {onPaymentHistoryClick && (
            <motion.button
              onClick={onPaymentHistoryClick}
              className="p-3 bg-white/15 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white/25 active:scale-95 touch-manipulation"
              title="سجلات الدفعات"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              aria-label="عرض سجل الدفعات"
            >
              <FileText className="w-5 h-5 text-white" />
            </motion.button>
          )}
          {!onPaymentHistoryClick && <div />}

          <div className="flex items-center gap-3">
            {/* ⭐ زر تحديث البيانات تم إزالته من هنا */}

            <motion.div
              className="p-3 bg-white/15 backdrop-blur-sm rounded-full shadow-md"
              title="الإنجازات (قريباً)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }} // يمكن تعديل التأخير إذا أردت
            >
              <Award className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 pt-2 text-center">
        <div className="relative inline-block">
            <div className={cn(
              "w-24 h-24 rounded-full",
              "border-4 border-white shadow-lg overflow-hidden",
              "bg-gray-200"
            )}>
              <Image
                src={avatarSrc}
                alt={`صورة ${fullName || 'المستخدم'}`}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo-288.png';
                }}
              />
            </div>
          </div>

        <div className="mt-3 space-y-2">
          <h1 className="text-xl font-bold text-white text-shadow-sm">
            {fullName || 'مستخدم'}
          </h1>
          <div className="flex flex-col items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4 text-blue-100" />
              <span className="text-white/90 truncate max-w-[180px] text-sm">
                @{username || 'غير محدد'}
              </span>
            </div>

            {telegramId && (
              <button
                onClick={handleCopyId}
                className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full hover:bg-white/25 transition-colors group cursor-pointer active:scale-95"
                title="اضغط لنسخ المعرف"
                aria-label={`نسخ المعرف ${telegramId}`}
              >
                <span className="text-white/80 text-xs font-mono">
                  ID: {telegramId}
                </span>
                <Copy className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" />
              </button>
            )}

            {joinDate && (
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>
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