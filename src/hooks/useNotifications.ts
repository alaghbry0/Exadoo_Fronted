// hooks/useNotifications.ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export function useNotifications(telegramId: string | null, filter: 'all' | 'unread' = 'all') {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['notifications', telegramId, filter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      // إعادة التحقق من الخادم عند كل طلب
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          params: {
            offset: pageParam,
            limit: 10,
            telegram_id: telegramId,
            filter,
            timestamp: Date.now() // تجنب التخزين المؤقت
          }
        }
      );

      // تحديث التخزين المؤقت فقط للصفحة الأولى
      if (pageParam === 0) {
        localStorage.setItem(
          `notifications_${telegramId}_${filter}`,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      }

      return data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length * 10 : undefined,
    enabled: !!telegramId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000,   // 10 دقائق
  });

  const invalidateCache = useCallback(() => {
    if (telegramId) {
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
      localStorage.removeItem(`notifications_${telegramId}_${filter}`);
    }
  }, [telegramId, filter, queryClient]);

  return { ...query, invalidateCache };
}
