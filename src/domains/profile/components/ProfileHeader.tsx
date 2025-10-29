// ProfileHeader.tsx
import React, { useMemo } from "react";
import { User, FileText, Award, Copy } from "lucide-react";
import SmartImage from "@/shared/components/common/SmartImage";

import { showToast } from "@/shared/components/ui/showToast";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { componentRadius, shadowClasses } from "@/styles/tokens";

import { cn } from "@/shared/utils";
import {
  profileHeaderContentStyle,
  profileHeaderInnerStyle,
  profileHeaderOverlayStyle,
  profileHeaderRootStyle,
  profileHeaderStackStyle,
} from "./ProfileTokens";

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

const ProfileAvatarImage = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof SmartImage>
>(({ className, ...props }, ref) => (
  <div ref={ref} className="h-full w-full">
    <SmartImage
      {...props}
      className={cn("h-full w-full object-cover", className)}
    />
  </div>
));
ProfileAvatarImage.displayName = "ProfileAvatarImage";

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
    <Card
      className={cn(
        "relative w-full overflow-hidden border-0 p-0",
        shadowClasses.cardHover,
      )}
      style={profileHeaderRootStyle}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={profileHeaderOverlayStyle}
      />

      <CardHeader
        className="relative z-[1] flex w-full items-start justify-between space-y-0 p-0"
        style={profileHeaderContentStyle}
      >
        <div
          className="flex w-full items-center justify-between"
          style={{ gap: "var(--profile-space-sm)" }}
        >
          {onPaymentHistoryClick ? (
            <button
              type="button"
              onClick={onPaymentHistoryClick}
              className={cn(
                "animate-scale-in transition-transform duration-200 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 touch-manipulation",
                componentRadius.badge,
                shadowClasses.buttonElevated,
              )}
              style={{
                animationDelay: "0.2s",
                background: "var(--profile-chip-background)",
                color: "var(--profile-chip-text)",
                paddingInline: "var(--profile-chip-padding-inline)",
                paddingBlock: "var(--profile-chip-padding-block)",
                boxShadow: "var(--profile-chip-shadow)",
                "--tw-ring-color": "var(--profile-ring-color)",
                "--tw-ring-offset-color": "var(--profile-ring-offset-color)",
              } as React.CSSProperties}
              title="سجلات الدفعات"
            >
              <FileText
                className="h-5 w-5"
                style={{ color: "var(--profile-chip-text)" }}
              />
            </button>
          ) : (
            <span aria-hidden className="inline-flex h-10 w-10" />
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
      </CardHeader>

      <CardContent
        className="relative z-[1] flex flex-col items-center space-y-0 p-0 text-center"
        style={profileHeaderInnerStyle}
      >
        <div className="relative inline-flex">
          <Avatar
            className={cn("h-24 w-24 overflow-hidden", componentRadius.badge)}
            style={{
              background: "var(--profile-avatar-bg)",
              borderWidth: "var(--profile-avatar-border-width)",
              borderColor: "var(--profile-avatar-border-color)",
              borderStyle: "solid",
              boxShadow: "var(--profile-avatar-shadow)",
            }}
          >
            <AvatarImage asChild>
              <ProfileAvatarImage
                src={avatarSrc}
                alt={`صورة ${fullName}`}
                width={96}
                height={96}
                blurType="primary"
                autoQuality
                fallbackSrc="/logo.png"
                priority
              />
            </AvatarImage>
          </Avatar>
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
      </CardContent>
    </Card>
  );
}
