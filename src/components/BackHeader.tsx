'use client';

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BackHeaderProps = {
  title?: string;               // يظهر تحت الشعار في المنتصف
  subtitle?: string;            // سطر ثانٍ رشيق
  className?: string;
  sticky?: boolean;             // افتراضياً مفعّل
  fallbackUrl?: string;         // لو ما في تاريخ للتراجع
  hideWhenNoHistory?: boolean;  // إخفاء زرّ الرجوع عند عدم وجود تاريخ
  /** جديد: إن كنت تفضّل زر تليجرام بدل زرّنا المحلي */
  preferTelegramBackButton?: boolean; // افتراضياً false => زرّنا يظهر دايمًا
  /** متوافق مع الإصدارات السابقة: سيتم اعتباره مثل preferTelegramBackButton */
  hideIfTgBackButton?: boolean;
  topOffsetPx?: number;         // إزاحة من الأعلى
  logoSrc?: string;             // مسار الشعار في المنتصف
  centerLogo?: boolean;         // إظهار الشعار بالمنتصف (افتراضياً true)
  onLogoClick?: () => void;     // سلوك عند الضغط على الشعار
  rightSlot?: React.ReactNode;  // زر إضافي يمين (اختياري)
};

type TelegramWebAppBackButton = {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
};

type TelegramWebApp = {
  BackButton: TelegramWebAppBackButton;
};

const HEADER_HEIGHT = 56; // px

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  className,
  sticky = true,
  fallbackUrl = '/shop',
  hideWhenNoHistory = false,
  preferTelegramBackButton,
  hideIfTgBackButton, // legacy
  topOffsetPx = 0,
  logoSrc = '/logo.png',
  centerLogo = true,
  onLogoClick,
  rightSlot,
}) => {
  const router = useRouter();

  const tg = useMemo<TelegramWebApp | null>(() => {
    if (typeof window === 'undefined') return null;
    return (window as any)?.Telegram?.WebApp ?? null;
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallbackUrl);
  };

  // فعّل زر تليجرام فقط لو المستخدم فضّله
  useEffect(() => {
    const preferTg =
      (typeof preferTelegramBackButton === 'boolean'
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
  }, [tg, preferTelegramBackButton, hideIfTgBackButton]);

  const noHistory = typeof window !== 'undefined' ? window.history.length <= 1 : false;

  // ✅ الآن زرّنا المحلي يظهر بشكل افتراضي حتى لو تليجرام يعرض زر خاص به
  const shouldShowLocalBtn = !(hideWhenNoHistory && noHistory) && true;

  return (
    <div
      dir="ltr"
      role="banner"
      className={cn(
        sticky && 'sticky z-40',
        'top-0',
        'backdrop-blur-md border-b border-gray-200/70',
        'bg-white/70 supports-[backdrop-filter]:bg-white/50',
        className
      )}
      style={{ top: sticky ? topOffsetPx : undefined }}
    >
      <div className="mx-auto max-w-7xl px-3">
        {/* شريط بارتفاع ثابت لضمان اتساق جميع الصفحات */}
        <div className="relative h-14 flex items-center">
          {/* يسار (في RTL هي البداية): زر الرجوع */}
          <div className="flex items-center">
      {shouldShowLocalBtn && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="رجوع"
          
        >
          <ChevronLeft
            size={32}          // ⬅️ أكبر من 28
            strokeWidth={2.5}  // ⬅️ أسمك شوية
            className="text-blue-600"
          />
        </Button>
            )}
          </div>

          {/* المنتصف: الشعار + العنوان/الوصف، مُتمركز تمامًا */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {centerLogo && (
                <button
                  type="button"
                  onClick={onLogoClick ?? (() => router.push('/'))}
                  aria-label="الانتقال للصفحة الرئيسية"
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100/60 transition"
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
                        <div className="text-sm md:text-base font-extrabold text-gray-900 leading-tight">
                          {title}
                        </div>
                      )}
                      {subtitle && (
                        <div className="text-[11px] md:text-xs text-gray-500 -mt-0.5">
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
                    <div className="text-sm md:text-base font-extrabold text-gray-900 leading-tight">
                      {title}
                    </div>
                  )}
                  {subtitle && (
                    <div className="text-[11px] md:text-xs text-gray-500 -mt-0.5">
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* يمين: فتحة لأكشن إضافي/محاذاة مثالية للمنتصف */}
          <div className="mr-auto flex items-center">
            {rightSlot ?? <div className="opacity-0 w-10 h-10" aria-hidden="true" />}
          </div>
        </div>
      </div>

      {/* خط سفلي ناعم بتدرّج */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
};

export default BackHeader;

// ملاحظة:
// - افتراضياً زرّنا المحلي ظاهر دائماً.
// - لو تبغى تعتمد زر تليجرام بداله مرّر preferTelegramBackButton={true}.
