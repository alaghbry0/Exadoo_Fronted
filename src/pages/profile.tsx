// src/pages/Profile.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useUserStore } from "@/shared/state/zustand/userStore";
import ProfileHeader from "@/domains/profile/components/ProfileHeader";
import SubscriptionsSection from "@/domains/profile/components/SubscriptionsSection";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { getUserSubscriptions } from "@/domains/subscriptions/api";
import { useRouter } from "next/navigation";
import { Toaster } from "@/shared/components/ui/toaster";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import PageLayout from "@/shared/components/layout/PageLayout";
import { colors, componentRadius, semanticSpacing, shadowClasses, withAlpha } from "@/styles/tokens";
import { cn } from "@/shared/utils/cn";
import { showToast } from "@/shared/components/ui/showToast";

export default function Profile() {
  const {
    fullName,
    telegramUsername,
    photoUrl,
    telegramId,
    subscriptions,
    setSubscriptions,
  } = useUserStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- منطق جلب البيانات (لا تغيير هنا) ---
  const queryKey = ["subscriptions", telegramId?.toString() || ""];
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!telegramId) throw new Error("المعرف غير موجود");
      return await getUserSubscriptions(telegramId.toString(), pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.nextPage ? lastPage.nextPage : undefined,
    enabled: !!telegramId,
    staleTime: 300000, // 5 دقائق
  });

  useEffect(() => {
    if (data) {
      const allSubscriptions = data.pages.flatMap((page) => page.subscriptions);
      setSubscriptions(allSubscriptions);
    }
  }, [data, setSubscriptions]);

  const goToPaymentHistory = () => router.push("/payment-history");

  const handleRefresh = async () => {
    if (!telegramId) return;
    setIsRefreshing(true);
    try {
      await refetch();
    } catch {
      showToast.error({
        title: "تعذّر تحديث البيانات",
        description: "يرجى المحاولة مرة أخرى بعد لحظات.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreHandler = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // --- شاشة تحميل جديدة وأكثر جاذبية ---
  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen font-arabic flex items-center justify-center"
        style={{
          backgroundColor: colors.bg.primary,
          color: colors.text.primary,
          padding: semanticSpacing.layout.md,
        }}
      >
        <PageLayout maxWidth="md">
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
        </PageLayout>
      </div>
    );
  }

  // --- شاشة خطأ محسّنة ---
  if (isError) {
    return (
      <div
        dir="rtl"
        className="min-h-screen font-arabic flex items-center justify-center"
        style={{
          backgroundColor: colors.bg.primary,
          color: colors.text.primary,
          padding: semanticSpacing.layout.md,
        }}
      >
        <PageLayout maxWidth="md">
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
              <Button onClick={() => refetch()} density="relaxed" className="font-arabic">
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        </PageLayout>
      </div>
    );
  }

  // --- العرض النهائي للصفحة مع كل التحسينات ---
  return (
    <>
      <Toaster />
      <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
        <div
          dir="rtl"
          className="min-h-screen font-arabic"
          style={{
            backgroundColor: colors.bg.primary,
            color: colors.text.primary,
            paddingBlock: semanticSpacing.section.sm,
          }}
        >
          <PageLayout maxWidth="2xl" className="px-0">
            <div
              className="w-full"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: semanticSpacing.section.sm,
                paddingInline: semanticSpacing.layout.sm,
              }}
            >
              <ProfileHeader
                fullName={fullName}
                username={telegramUsername}
                profilePhoto={photoUrl}
                telegramId={telegramId}
                onPaymentHistoryClick={goToPaymentHistory}
              />
              <div
                className="w-full max-w-4xl mx-auto"
                style={{ paddingBlock: semanticSpacing.section.sm }}
              >
                <SubscriptionsSection
                  subscriptions={subscriptions || []}
                  loadMore={loadMoreHandler}
                  hasMore={!!hasNextPage}
                  isLoadingMore={isFetchingNextPage}
                  isRefreshing={isRefreshing}
                  onRefreshClick={handleRefresh}
                />
              </div>
            </div>
          </PageLayout>
        </div>
      </TonConnectUIProvider>
    </>
  );
}
