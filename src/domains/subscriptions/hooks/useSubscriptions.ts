/**
 * Hook مخصص لإدارة الاشتراكات باستخدام React Query
 * يستبدل localStorage polling بنظام أكثر كفاءة
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import logger from "@/infrastructure/logging/logger";
import type { Subscription } from "@/domains/subscriptions/types";

// Fetch subscriptions من الـ API
async function fetchSubscriptionsFromAPI(
  telegramId: string,
): Promise<Subscription[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/${telegramId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions");
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch subscriptions from API", error);
    throw error;
  }
}

// Hook رئيسي
export function useSubscriptions(telegramId: string | null) {
  const _queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subscriptions", telegramId],
    queryFn: () => fetchSubscriptionsFromAPI(telegramId!),
    enabled: !!telegramId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // حفظ في localStorage كـ cache
    initialData: () => {
      if (!telegramId) return undefined;

      try {
        const cached = localStorage.getItem(`subscriptions_${telegramId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // استخدم الـ cache فقط إذا كان حديثاً (أقل من 5 دقائق)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            return data;
          }
        }
      } catch (error) {
        logger.error("Failed to load cached subscriptions", error);
      }

      return undefined;
    },
  });

  // حفظ في localStorage عند التحديث
  useEffect(() => {
    if (query.data && telegramId) {
      try {
        localStorage.setItem(
          `subscriptions_${telegramId}`,
          JSON.stringify({
            data: query.data,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        logger.error("Failed to cache subscriptions", error);
      }
    }
  }, [query.data, telegramId]);

  return {
    subscriptions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook للاستماع إلى تحديثات SSE (اختياري)
export function useSubscriptionSSE(
  telegramId: string | null,
  onUpdate?: (data: Subscription[]) => void,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!telegramId) return;

    // تحقق من دعم SSE
    if (typeof EventSource === "undefined") {
      logger.warn("SSE not supported in this browser");
      return;
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_SSE_URL || process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/stream/${telegramId}`;

    let eventSource: EventSource;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // تحديث React Query cache
          queryClient.setQueryData(["subscriptions", telegramId], data);

          // استدعاء callback إذا كان موجوداً
          onUpdate?.(data);

          logger.info("Subscriptions updated via SSE");
        } catch (error) {
          logger.error("Failed to parse SSE data", error);
        }
      };

      eventSource.onerror = (error) => {
        logger.error("SSE connection error", error);
        eventSource.close();
      };
    } catch (error) {
      logger.error("Failed to establish SSE connection", error);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [telegramId, queryClient, onUpdate]);
}
