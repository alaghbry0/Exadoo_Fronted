"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import ProfileHeader from "@/domains/profile/components/ProfileHeader";
import PageLayout from "@/shared/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import {
  colors,
  componentRadius,
  radius,
  semanticSpacing,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

const demoProfileProps = {
  fullName: "آمنة الشمري",
  username: "amina.trader",
  profilePhoto: "/logo.png",
  telegramId: "123456789",
  onPaymentHistoryClick: () => undefined,
};

export default function ProfileDesignDemoPage() {
  return (
    <div
      className="min-h-screen font-arabic"
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
        paddingBlock: semanticSpacing.section.md,
      }}
    >
      <PageLayout maxWidth="4xl" className="px-0">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: semanticSpacing.section.md,
            paddingInline: semanticSpacing.layout.sm,
          }}
        >
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: semanticSpacing.component.sm,
            }}
          >
            <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
              معاينة واجهة الملف الشخصي
            </h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              تحقق من الاتساق البصري في الوضعين الفاتح والداكن بعد تحديث عناصر الملف الشخصي.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <ThemePreview label="الوضع الفاتح">
              <ProfileHeader {...demoProfileProps} />
              <DemoLoadingCard />
              <DemoErrorCard />
            </ThemePreview>

            <ThemePreview label="الوضع الداكن" isDark>
              <ProfileHeader {...demoProfileProps} />
              <DemoLoadingCard />
              <DemoErrorCard />
            </ThemePreview>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}

function ThemePreview({
  label,
  children,
  isDark = false,
}: {
  label: string;
  children: React.ReactNode;
  isDark?: boolean;
}) {
  return (
    <div
      className={cn("flex flex-col gap-6", isDark && "dark")}
      style={{
        padding: semanticSpacing.section.sm,
        borderRadius: radius["3xl"],
        backgroundColor: withAlpha(colors.bg.secondary, 0.4),
      }}
    >
      <div>
        <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
          {label}
        </h2>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          معاينة الحالة التفاعلية للمكوّنات في {label}.
        </p>
      </div>
      <div
        className={cn("rounded-3xl border", shadowClasses.card)}
        style={{
          backgroundColor: colors.bg.primary,
          borderColor: colors.border.default,
          color: colors.text.primary,
          display: "flex",
          flexDirection: "column",
          gap: semanticSpacing.section.sm,
          padding: semanticSpacing.section.sm,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DemoLoadingCard() {
  return (
    <Card
      className={cn("w-full", shadowClasses.card)}
      style={{
        background: colors.bg.elevated,
        borderColor: colors.border.default,
      }}
    >
      <CardContent
        className="flex flex-col items-center justify-center text-center"
        style={{ gap: semanticSpacing.component.lg, padding: semanticSpacing.section.sm }}
      >
        <Loader2
          className="h-12 w-12 animate-spin"
          style={{ color: colors.brand.primary }}
        />
        <p className="font-semibold" style={{ color: colors.text.secondary }}>
          جارٍ تحميل ملفك الشخصي...
        </p>
      </CardContent>
    </Card>
  );
}

function DemoErrorCard() {
  return (
    <Card
      className={cn("w-full text-center", shadowClasses.card)}
      style={{
        background: colors.bg.elevated,
        borderColor: colors.border.default,
      }}
    >
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <div
          className={cn("flex h-12 w-12 items-center justify-center", componentRadius.badge)}
          style={{
            background: withAlpha(colors.status.error, 0.12),
            color: colors.status.error,
          }}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <CardTitle style={{ color: colors.status.error }}>
          حدث خطأ
        </CardTitle>
      </CardHeader>
      <CardContent
        className="flex flex-col items-center"
        style={{ gap: semanticSpacing.component.lg, padding: semanticSpacing.section.sm }}
      >
        <p style={{ color: colors.text.secondary }}>
          فشل تحميل بياناتك. يرجى المحاولة مرة أخرى.
        </p>
        <Button disabled density="relaxed" className="font-arabic opacity-80">
          إعادة المحاولة
        </Button>
      </CardContent>
    </Card>
  );
}
