// ProfileHeader.tsx
import React, { useMemo } from "react";
import { User, FileText, Award, Copy } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";

import { showToast } from "@/shared/components/ui/showToast";
import { componentRadius, shadowClasses } from "@/styles/tokens";


import { cn } from "@/shared/utils";
import {
  profileHeaderContentStyle,
  profileHeaderInnerStyle,
  profileHeaderOverlayStyle,
  profileHeaderRootStyle,
  profileHeaderStackStyle,
} from "./ProfileTokens";
import { Button } from "@/shared/components/ui/button";

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
      showToast.error({
        title: "لا يوجد معرف متاح",
        description: "تعذر العثور على معرف تيليجرام لنسخه.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(telegramId.toString());
      showToast.success({
        title: "تم نسخ المعرف", 
        description: "يمكنك الآن لصق المعرف في أي مكان تريده.",
      });
    } catch (err) {
      console.error("فشل نسخ المعرف:", err);
      showToast.error({
        title: "فشل النسخ",
        description: "يرجى المحاولة مرة أخرى بعد التأكد من أذونات المتصفح.",
      });
    }
  };

  return (
    <div
      className={cn("relative w-full overflow-hidden", shadowClasses.cardHover)}
      style={profileHeaderRootStyle}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={profileHeaderOverlayStyle}
      />

      <div
        className="relative"
        style={profileHeaderContentStyle}
      >
        <div className="flex items-start justify-between">
          {onPaymentHistoryClick ? (
            <Button
              type="button"
              onClick={onPaymentHistoryClick}
              intent="secondary"
              density="compact"
              aria-label="عرض سجل المدفوعات"
              className={cn(
                "animate-scale-in transition-transform duration-200 backdrop-blur-md active:scale-95 touch-manipulation font-arabic",
                componentRadius.badge,
                shadowClasses.buttonElevated,
              )}
              intentOverrides={{
                background: "var(--profile-chip-background)",
                foreground: "var(--profile-chip-text)",
                hoverBackground: "var(--profile-chip-background)",
                hoverForeground: "var(--profile-chip-text-strong)",
                focusRing: "var(--profile-ring-color)",
                border: "transparent",
              }}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>سجل المدفوعات</span>
            </Button>
          ) : (
            <div />
          )}

          <div
            className={cn(
              "animate-scale-in transition-transform duration-200 backdrop-blur-md",
              componentRadius.badge,
              shadowClasses.buttonElevated,
            )}
            style={{
              animationDelay: "0.3s",
              background: "var(--profile-chip-background)",
              color: "var(--profile-chip-text)",
              paddingInline: "var(--profile-chip-padding-inline)",
              paddingBlock: "var(--profile-chip-padding-block)",
              boxShadow: "var(--profile-chip-shadow)",
            }}
            title="الإنجازات (قريباً)"
          >
            <Award
              className="h-5 w-5"
              style={{ color: "var(--profile-chip-text-muted)" }}
            />
          </div>
        </div>

        <div
          className="text-center"
          style={profileHeaderInnerStyle}
        >
          <div className="relative inline-block">
            <div
              className={cn("h-24 w-24 overflow-hidden", componentRadius.badge)}
              style={{
                background: "var(--profile-avatar-bg)",
                borderWidth: "var(--profile-avatar-border-width)",
                borderColor: "var(--profile-avatar-border-color)",
                borderStyle: "solid",
                boxShadow: "var(--profile-avatar-shadow)",
              }}
            >
              <SmartImage
                src={avatarSrc}
                alt={`صورة ${fullName}`}
                width={96}
                height={96}
                blurType="primary"
                autoQuality
                fallbackSrc="/logo.png"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div style={profileHeaderStackStyle}>
            <h1
              className="text-2xl font-bold text-shadow-sm"
              style={{ color: "var(--profile-header-text-color)" }}
            >
              {fullName}
            </h1>
            <div
              className="flex flex-col items-center justify-center"
              style={{ gap: "var(--profile-space-sm)" }}
            >
              {username && (
                <div
                  className={cn("flex items-center", componentRadius.badge)}
                  style={{
                    background: "var(--profile-chip-background)",
                    color: "var(--profile-chip-text)",
                    gap: "var(--profile-space-sm)",
                    paddingInline: "var(--profile-chip-padding-inline)",
                    paddingBlock: "var(--profile-chip-padding-block)",
                    boxShadow: "var(--profile-chip-shadow)",
                  }}
                >
                  <User
                    className="h-4 w-4"
                    style={{ color: "var(--profile-chip-text-muted)" }}
                  />
                  <span
                    className="truncate text-sm"
                    style={{
                      color: "var(--profile-chip-text-strong)",
                      maxWidth: "180px",
                    }}
                  >
                    @{username}
                  </span>
                </div>
              )}
              {telegramId && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  className={cn(
                    "group flex items-center transition-transform duration-200 active:scale-95",
                    componentRadius.badge,
                  )}
                  style={{
                    background: "var(--profile-chip-background)",
                    color: "var(--profile-chip-text-strong)",
                    gap: "var(--profile-space-sm)",
                    paddingInline: "var(--profile-chip-padding-inline)",
                    paddingBlock: "var(--profile-chip-padding-block)",
                    boxShadow: "var(--profile-chip-shadow)",
                  }}
                  title="اضغط لنسخ المعرف"
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--profile-chip-text-soft)" }}
                  >
                    ID: {telegramId}
                  </span>
                  <Copy
                    className="h-3.5 w-3.5 transition-colors"
                    style={{ color: "var(--profile-chip-icon)" }}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
