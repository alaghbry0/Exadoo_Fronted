// ProfileHeader.tsx
import React, { useMemo } from "react";
import { User, FileText, Award, Copy, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import SmartImage from "@/shared/components/common/SmartImage";
import {
  colors,
  componentRadius,
  gradients,
  radius,
  semanticSpacing,
  shadows,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";
import { cn } from "@/shared/utils/cn";

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
        icon: (
          <CheckCircle
            className="h-5 w-5"
            style={{ color: colors.status.success }}
          />
        ),
      });
    } catch (err) {
      console.error("فشل نسخ المعرف:", err);
      toast.error("فشل نسخ المعرف. يرجى المحاولة مرة أخرى.");
    }
  };

  const chipPaddingX = semanticSpacing.component.lg;
  const chipPaddingY = semanticSpacing.component.xs;
  const chipBackground = withAlpha(colors.bg.primary, 0.16);
  const chipHoverShadow = shadows.elevation[3];

  return (
    <div
      className={cn("relative w-full overflow-hidden", shadowClasses.cardHover)}
      style={{
        background: gradients.brand.primary,
        borderRadius: radius["3xl"],
        color: colors.text.inverse,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: gradients.effects.neutralSheen,
          opacity: 0.4,
        }}
      />

      <div
        className="relative"
        style={{
          paddingInline: semanticSpacing.layout.sm,
          paddingBlockStart: semanticSpacing.section.sm,
          paddingBlockEnd: semanticSpacing.section.sm,
        }}
      >
        <div className="flex items-start justify-between">
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
                background: chipBackground,
                color: colors.text.inverse,
                paddingInline: chipPaddingX,
                paddingBlock: chipPaddingY,
                boxShadow: chipHoverShadow,
                "--tw-ring-color": colors.border.focus,
                "--tw-ring-offset-color": colors.bg.primary,
              } as React.CSSProperties}
              title="سجلات الدفعات"
            >
              <FileText className="h-5 w-5" style={{ color: colors.text.inverse }} />
            </button>
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
              background: chipBackground,
              color: colors.text.inverse,
              paddingInline: chipPaddingX,
              paddingBlock: chipPaddingY,
              boxShadow: chipHoverShadow,
            }}
            title="الإنجازات (قريباً)"
          >
            <Award
              className="h-5 w-5"
              style={{ color: withAlpha(colors.text.inverse, 0.85) }}
            />
          </div>
        </div>

        <div
          className="text-center"
          style={{
            paddingInline: semanticSpacing.layout.sm,
            paddingBlockStart: semanticSpacing.component.sm,
          }}
        >
          <div className="relative inline-block">
            <div
              className={cn("h-24 w-24 overflow-hidden", componentRadius.badge)}
              style={{
                background: withAlpha(colors.bg.inverse, 0.4),
                border: `4px solid ${withAlpha(colors.text.inverse, 0.75)}`,
                boxShadow: shadows.elevation[4],
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

          <div
            style={{
              marginTop: semanticSpacing.component.md,
              display: "flex",
              flexDirection: "column",
              gap: semanticSpacing.component.sm,
            }}
          >
            <h1
              className="text-2xl font-bold text-shadow-sm"
              style={{ color: colors.text.inverse }}
            >
              {fullName}
            </h1>
            <div
              className="flex flex-col items-center justify-center"
              style={{ gap: semanticSpacing.component.sm }}
            >
              {username && (
                <div
                  className={cn("flex items-center", componentRadius.badge)}
                  style={{
                    background: chipBackground,
                    color: colors.text.inverse,
                    gap: semanticSpacing.component.sm,
                    paddingInline: chipPaddingX,
                    paddingBlock: chipPaddingY,
                    boxShadow: chipHoverShadow,
                  }}
                >
                  <User
                    className="h-4 w-4"
                    style={{ color: withAlpha(colors.text.inverse, 0.85) }}
                  />
                  <span
                    className="truncate text-sm"
                    style={{
                      color: withAlpha(colors.text.inverse, 0.92),
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
                    background: chipBackground,
                    color: withAlpha(colors.text.inverse, 0.92),
                    gap: semanticSpacing.component.sm,
                    paddingInline: chipPaddingX,
                    paddingBlock: chipPaddingY,
                    boxShadow: chipHoverShadow,
                  }}
                  title="اضغط لنسخ المعرف"
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: withAlpha(colors.text.inverse, 0.82) }}
                  >
                    ID: {telegramId}
                  </span>
                  <Copy
                    className="h-3.5 w-3.5 transition-colors"
                    style={{ color: withAlpha(colors.text.inverse, 0.7) }}
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
