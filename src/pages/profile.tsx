// src/pages/Profile.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import ProfileHeader from "@/domains/profile/components/ProfileHeader";
import SubscriptionsSection from "@/domains/profile/components/SubscriptionsSection";
import { getUserSubscriptions } from "@/domains/subscriptions/api";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { Toaster } from "@/shared/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PageLayout, Section, Stack } from "@/shared/components/layout";
import { cn } from "@/shared/utils/cn";
import { showToast } from "@/shared/components/ui/showToast";
import {
  colors,
  componentRadius,
  semanticSpacing,
  shadowClasses,
  spacing,
  withAlpha,
} from "@/styles/tokens";

import styles from "./profile.module.css";

const PAGE_STYLE_VARS = {
  "--profile-page-background": colors.bg.primary,
  "--profile-page-foreground": colors.text.primary,
  "--profile-page-padding-block": semanticSpacing.section.sm,
  "--profile-page-padding-inline": semanticSpacing.layout.sm,
  "--profile-page-padding-inline-desktop": semanticSpacing.layout.md,
  "--profile-card-background": colors.bg.elevated,
  "--profile-card-border": colors.border.default,
  "--profile-card-content-gap": semanticSpacing.component.lg,
  "--profile-card-content-padding": semanticSpacing.section.sm,
  "--profile-brand-color": colors.brand.primary,
  "--profile-text-secondary": colors.text.secondary,
  "--profile-error-icon-size": spacing[12],
  "--profile-error-icon-background": withAlpha(colors.status.error, 0.12),
  "--profile-error-icon-color": colors.status.error,
  "--profile-error-title-color": colors.status.error,
  "--profile-subscriptions-max-width": "56rem",
} as const;

function usePageStyle(): React.CSSProperties {
  return useMemo(() => ({ ...PAGE_STYLE_VARS } as React.CSSProperties), []);
}

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

  const pageStyle = usePageStyle();

  const renderStateShell = (state: "loading" | "error") => (
    <div dir="rtl" className={cn(styles.root, "font-arabic")} style={pageStyle}>
      <PageLayout maxWidth="md" className={styles.layout}>
        <Section as="div" className={styles.centerLayout} paddingBlock="section.sm">
          <Card className={cn("w-full", shadowClasses.card, styles.stateCard)}>
            {state === "error" ? (
              <>
                <CardHeader className="flex flex-col items-center gap-4 text-center">
                  <div className={cn(styles.errorHeaderIcon, componentRadius.badge)}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <CardTitle className={styles.errorTitle}>حدث خطأ</CardTitle>
                </CardHeader>
                <CardContent className={styles.stateContent}>
                  <p className={styles.stateText}>
                    فشل تحميل بياناتك. يرجى المحاولة مرة أخرى.
                  </p>
                  <Button
                    onClick={() => refetch()}
                    density="relaxed"
                    className="font-arabic"
                    intent="secondary"
                  >
                    إعادة المحاولة
                  </Button>
                </CardContent>
              </>
            ) : (
              <CardContent className={styles.stateContent}>
                <Loader2 className={cn("h-12 w-12 animate-spin", styles.loaderIcon)} />
                <p className={styles.stateText}>جارٍ تحميل ملفك الشخصي...</p>
              </CardContent>
            )}
          </Card>
        </Section>
      </PageLayout>
    </div>
  );

  if (isLoading) {
    return renderStateShell("loading");
  }

  if (isError) {
    return renderStateShell("error");
  }

  return (
    <>
      <Toaster />
      <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
        <div dir="rtl" className={cn(styles.root, "font-arabic")} style={pageStyle}>
          <PageLayout maxWidth="2xl" className={styles.layout}>
            <Stack gap="section.sm" fullWidth className={styles.contentStack}>
              <ProfileHeader
                fullName={fullName}
                username={telegramUsername}
                profilePhoto={photoUrl}
                telegramId={telegramId}
                onPaymentHistoryClick={goToPaymentHistory}
              />
              <Section
                as="div"
                className={styles.subscriptionsSection}
                paddingBlock="section.sm"
              >
                <SubscriptionsSection
                  subscriptions={subscriptions || []}
                  loadMore={loadMoreHandler}
                  hasMore={!!hasNextPage}
                  isLoadingMore={isFetchingNextPage}
                  isRefreshing={isRefreshing}
                  onRefreshClick={handleRefresh}
                />
              </Section>
            </Stack>
          </PageLayout>
        </div>
      </TonConnectUIProvider>
    </>
  );
}
