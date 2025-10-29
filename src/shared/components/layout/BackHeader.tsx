"use client";

import React, { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { colors, withAlpha } from "@/styles/tokens";

type BackMode = "always" | "fallback" | "replace";

type BackHeaderProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  sticky?: boolean;
  /** الوجهة المفضلة للرجوع */
  backTo?: string; // جديد
  /** كيف نتصرف عند الرجوع */
  backMode?: BackMode; // جديد: 'always' | 'fallback' | 'replace' (افتراضي 'fallback')
  fallbackUrl?: string; // ما زالت مدعومة (كاحتياط)
  hideWhenNoHistory?: boolean;
  preferTelegramBackButton?: boolean;
  hideIfTgBackButton?: boolean; // legacy
  topOffsetPx?: number;
  logoSrc?: string;
  centerLogo?: boolean;
  onLogoClick?: () => void;
  rightSlot?: React.ReactNode;
  /** لو حاب تمرر onBack مخصص، سنستدعيه بدل السلوك الافتراضي */
  onBack?: () => void; // جديد (اختياري)
};

type TelegramWebAppBackButton = {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
};
type TelegramWebApp = { BackButton: TelegramWebAppBackButton };

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  className,
  sticky = true,
  backTo, // ← جديد
  backMode = "fallback", // ← جديد
  fallbackUrl = "/shop",
  hideWhenNoHistory = false,
  preferTelegramBackButton,
  hideIfTgBackButton,
  topOffsetPx = 0,
  logoSrc = "/logo.png",
  centerLogo = true,
  onLogoClick,
  rightSlot,
  onBack, // ← جديد
}) => {
  const router = useRouter();

  const tg = useMemo<TelegramWebApp | null>(() => {
    if (typeof window === "undefined") return null;
    return (window as any)?.Telegram?.WebApp ?? null;
  }, []);

  const goTo = (href: string, mode: BackMode) => {
    if (!href) return;
    if (mode === "replace") router.replace(href);
    else router.push(href);
  };

  const handleBack = () => {
    // أولوية لأي onBack مخصص
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    const target = backTo || fallbackUrl;
    const hasHistory =
      typeof window !== "undefined" && window.history.length > 1;

    if (backMode === "always") {
      // تجاهل التاريخ دائمًا
      return goTo(target, "push" as any); // نستخدم push هنا
    }

    if (backMode === "replace") {
      return goTo(target, "replace");
    }

    // fallback (السلوك القديم): جرّب التاريخ، وإلا ارجع للهدف
    if (hasHistory) {
      window.history.back();
    } else {
      goTo(target, "push" as any);
    }
  };

  useEffect(() => {
    const preferTg =
      (typeof preferTelegramBackButton === "boolean"
        ? preferTelegramBackButton
        : !!hideIfTgBackButton) || false;

    if (!tg || !preferTg) return;
    const btn = tg.BackButton;
    const onClick = () => handleBack();
    btn.show();
    btn.onClick(onClick);
    return () => {
      btn.offClick(onClick);
      btn.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tg, preferTelegramBackButton, hideIfTgBackButton, backTo, backMode]);

  const noHistory =
    typeof window !== "undefined" ? window.history.length <= 1 : false;
  const shouldShowLocalBtn = !(hideWhenNoHistory && noHistory);

  const headerStyles = useMemo<CSSProperties>(() => {
    const styles: CSSProperties = {};

    if (sticky) {
      styles.top = topOffsetPx;
    }

    (styles as Record<string, string | number>)["--header-bg"] = withAlpha(
      colors.bg.elevated,
      0.82,
    );
    (styles as Record<string, string | number>)[
      "--header-bg-supports"
    ] = withAlpha(colors.bg.elevated, 0.68);
    (styles as Record<string, string | number>)[
      "--header-border-color"
    ] = withAlpha(colors.border.default, 0.7);

    return styles;
  }, [sticky, topOffsetPx]);

  const logoButtonStyles = useMemo<CSSProperties>(
    () =>
      ({
        "--header-logo-hover-bg": withAlpha(colors.bg.secondary, 0.55),
        color: colors.text.primary,
      }) as CSSProperties,
    [],
  );

  const dividerStyle = useMemo<CSSProperties>(
    () =>
      ({
        background: `linear-gradient(90deg, transparent 0%, ${withAlpha(
          colors.border.default,
          0.6,
        )} 50%, transparent 100%)`,
      }) as CSSProperties,
    [],
  );

  const backButtonOverrides = useMemo(
    () => ({ hoverBackground: withAlpha(colors.bg.secondary, 0.5) }),
    [],
  );

  return (
    <div
      dir="ltr"
      role="banner"
      className={cn(
        sticky && "sticky z-40",
        "top-0",
        "backdrop-blur-md border-b",
        "bg-[color:var(--header-bg)] supports-[backdrop-filter]:bg-[color:var(--header-bg-supports)]",
        "border-[color:var(--header-border-color)]",
        className,
      )}
      style={headerStyles}
    >
      <div className="mx-auto max-w-7xl px-3">
        <div className="relative flex h-14 items-center">
          {/* زر الرجوع */}
          <div className="flex items-center">
            {shouldShowLocalBtn && (
              <Button
                type="button"
                intent="ghost"
                density="icon"
                onClick={handleBack}
                aria-label="رجوع"
                intentOverrides={backButtonOverrides}
              >
                <ChevronLeft
                  size={32}
                  strokeWidth={2.5}
                  className="text-[var(--color-text-primary)]"
                />
              </Button>
            )}
          </div>

          {/* المنتصف */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-2">
              {centerLogo && (
                <button
                  type="button"
                  onClick={onLogoClick ?? (() => router.push("/"))}
                  aria-label="الانتقال للصفحة الرئيسية"
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-1 transition",
                    "hover:bg-[color:var(--header-logo-hover-bg)]",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[color:var(--color-border-focus)]",
                    "focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-[color:var(--color-bg-primary)]",
                  )}
                  style={logoButtonStyles}
                >
                  <Image
                    src={logoSrc}
                    alt="Exaado logo"
                    width={30}
                    height={30}
                    className="rounded-md object-contain"
                    priority
                  />
                  {(title || subtitle) && (
                    <div className="text-center">
                      {title && (
                        <div className="leading-tight text-sm font-extrabold text-[var(--color-text-primary)] md:text-base">
                          {title}
                        </div>
                      )}
                      {subtitle && (
                        <div className="-mt-0.5 text-[11px] text-[var(--color-text-secondary)] md:text-xs">
                          {subtitle}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )}
              {!centerLogo && (title || subtitle) && (
                <div className="text-center">
                  {title && (
                    <div className="leading-tight text-sm font-extrabold text-[var(--color-text-primary)] md:text-base">
                      {title}
                    </div>
                  )}
                  {subtitle && (
                    <div className="-mt-0.5 text-[11px] text-[var(--color-text-secondary)] md:text-xs">
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* يمين */}
          <div className="mr-auto flex items-center">
            {rightSlot ?? (
              <div className="h-10 w-10 opacity-0" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      <div className="h-px" style={dividerStyle} aria-hidden="true" />
    </div>
  );
};

export default BackHeader;
