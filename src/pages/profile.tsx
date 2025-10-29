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
import { semanticSpacing } from "@/styles/tokens";
import { showToast } from "@/shared/components/ui/showToast";
import { ProfilePageContainer, ProfileStateCard } from "@/domains/profile/components/ProfileLayout";

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
    return <ProfileStateCard variant="loading" />;
  }

  // --- شاشة خطأ محسّنة ---
  if (isError) {
    return <ProfileStateCard variant="error" onRetry={() => refetch()} />;
  }

  // --- العرض النهائي للصفحة مع كل التحسينات ---
  return (
    <>
      <Toaster />
      <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/AliRaheem-ExaDoo/aib-manifest/main/tonconnect-manifest.json">
        <ProfilePageContainer>
          <section
            className="w-full"
            style={{
              display: "grid",
              gap: semanticSpacing.section.sm,
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
              className="mx-auto w-full max-w-4xl"
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
          </section>
        </ProfilePageContainer>
      </TonConnectUIProvider>
    </>
  );
}
