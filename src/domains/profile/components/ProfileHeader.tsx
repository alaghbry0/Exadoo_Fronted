// ProfileHeader.tsx
import React, { useMemo } from "react";
import { User, FileText, Award, Copy, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import SmartImage from "@/shared/components/common/SmartImage";

// --- دالة مساعدة للتحقق من رابط الصورة ---
export function getValidPhotoUrl(
  url: string | null,
  defaultAvatar: string = "/logo.png",
): string {
  if (!url) return defaultAvatar;
  try {
    // التحقق من أن الرابط يبدأ بـ https ويتبع بنية صحيحة
    if (url.startsWith("https://")) {
      new URL(url);
      return url;
    }
  } catch (error) {
    console.warn("Invalid photo URL, using default:", url, error);
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

export default function ProfileHeader({
  fullName = "مستخدم بدون اسم",
  username = "بدون معرف",
  profilePhoto,
  telegramId,
  onPaymentHistoryClick,
}: ProfileHeaderProps) {
  const avatarSrc = useMemo(
    () => getValidPhotoUrl(profilePhoto ?? null, "/logo.png"),
    [profilePhoto],
  );

  const handleCopyId = async () => {
    if (!telegramId) {
      toast.error("المعرف غير متوفر للنسخ.");
      return;
    }
    try {
      await navigator.clipboard.writeText(telegramId.toString());
      toast.success("تم نسخ المعرف بنجاح!", {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
    } catch (err) {
      console.error("فشل نسخ المعرف:", err);
      toast.error("فشل نسخ المعرف. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    // --- استخدام تدرج لوني حيوي مع نمط بصري خفيف ---
    <div className="w-full bg-gradient-to-br from-primary-900 to-primary-500 rounded-b-3xl shadow-lg overflow-hidden relative">
      {/* طبقة نمط زخرفي (اختياري، يمكنك استبدال الرابط أو حذفه) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMCI+PC9yZWN0Pgo8cGF0aCBkPSJNMjggNjZMMCA1MEwwIDMzTDI4IDE3TDU2IDMzTDU2IDUwTDI4IDY2TDI4IDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA2M0wyOCA3OUw1NiA2M0w1NiA1MEwyOCAzNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-10 pointer-events-none" />

      <div className="relative pt-5 px-4">
        {/* أزرار الإجراءات في الأعلى */}
        <div className="flex justify-between items-start">
          {/* إضافة حركة بسيطة للزر مع التحقق من وجود الدالة */}
          {onPaymentHistoryClick && (
            <button
              onClick={onPaymentHistoryClick}
              className="animate-scale-in p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white/20 active:scale-95 touch-manipulation"
              style={{ animationDelay: "0.2s" }}
              title="سجلات الدفعات"
            >
              <FileText className="w-5 h-5 text-white" />
            </button>
          )}
          {/* عنصر نائب للحفاظ على التنسيق إذا لم يكن الزر موجودًا */}
          {!onPaymentHistoryClick && <div />}

          <div
            className="animate-scale-in p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-md"
            style={{ animationDelay: "0.3s" }}
            title="الإنجازات (قريباً)"
          >
            <Award className="w-5 h-5 text-white/80" />
          </div>
        </div>

        {/* معلومات المستخدم الأساسية */}
        <div className="px-4 pb-6 pt-2 text-center">
          {/* الصورة الشخصية */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-white/80 shadow-lg overflow-hidden bg-slate-700">
              <SmartImage
                src={avatarSrc}
                alt={`صورة ${fullName}`}
                width={96}
                height={96}
                blurType="primary"
                autoQuality
                fallbackSrc="/logo.png"
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* معلومات المستخدم */}
          <div className="mt-3 space-y-2">
            <h1 className="text-2xl font-bold text-white text-shadow-sm">
              {fullName}
            </h1>
            <div className="flex flex-col items-center justify-center gap-2 text-sm">
              {username && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-200 truncate max-w-[180px] text-sm">
                    @{username}
                  </span>
                </div>
              )}
              {telegramId && (
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors group cursor-pointer active:scale-95"
                  title="اضغط لنسخ المعرف"
                >
                  <span className="text-slate-300 text-xs font-mono">
                    ID: {telegramId}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
