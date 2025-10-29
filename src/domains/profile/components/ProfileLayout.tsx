"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import PageLayout from "@/shared/components/layout/PageLayout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/utils";
import { colors, componentRadius, semanticSpacing, shadowClasses, withAlpha } from "@/styles/tokens";

interface ProfilePageContainerProps {
  children: ReactNode;
}

interface ProfileStateCardProps {
  variant: "loading" | "error";
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ProfilePageContainer({ children }: ProfilePageContainerProps) {
  return (
    <div
      dir="rtl"
      className="min-h-screen font-arabic"
      style={{
        backgroundColor: colors.bg.primary,
        color: colors.text.primary,
        paddingBlock: semanticSpacing.section.sm,
      }}
    >
      <PageLayout maxWidth="2xl">{children}</PageLayout>
    </div>
  );
}

export function ProfileStateCard({
  variant,
  description,
  onRetry,
  retryLabel = "إعادة المحاولة",
}: ProfileStateCardProps) {
  const isLoading = variant === "loading";
  const stateDescription =
    description ??
    (isLoading
      ? "جارٍ تحميل ملفك الشخصي..."
      : "فشل تحميل بياناتك. يرجى المحاولة مرة أخرى.");

  return (
    <ProfilePageContainer>
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ paddingInline: semanticSpacing.layout.sm }}
      >
        <Card
          className={cn("w-full max-w-md border", shadowClasses.card)}
          style={{
            backgroundColor: colors.bg.elevated,
            borderColor: withAlpha(colors.border.default, 0.85),
          }}
        >
          <CardHeader className="items-center text-center">
            {isLoading ? (
              <Spinner />
            ) : (
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center",
                  componentRadius.badge,
                )}
                style={{
                  backgroundColor: withAlpha(colors.status.error, 0.12),
                  color: colors.status.error,
                }}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
            )}
            <CardTitle
              className="font-arabic"
              style={{ color: isLoading ? colors.text.primary : colors.status.error }}
            >
              {isLoading ? "جارٍ التحميل" : "حدث خطأ"}
            </CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col items-center text-center"
            style={{
              gap: semanticSpacing.component.lg,
              paddingBlock: semanticSpacing.section.sm,
            }}
          >
            <p style={{ color: colors.text.secondary }}>{stateDescription}</p>
            {!isLoading && onRetry ? (
              <Button onClick={onRetry} density="relaxed" className="font-arabic">
                {retryLabel}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ProfilePageContainer>
  );
}
