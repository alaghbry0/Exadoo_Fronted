// hooks/useNotifications.ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

export function useNotifications(telegramId: string | null, filter: 'all' | 'unread' = 'all') {
  const queryClient = useQueryClient();

  // Use React Query for data fetching with caching
  const query = useInfiniteQuery({
    queryKey: ['notifications', telegramId, filter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      // First try to get from cache if it's the first page
      if (pageParam === 0) {
        const cachedData = localStorage.getItem(`notifications_${telegramId}_${filter}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          // Use cache if it's less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            return data;
          }
        }
      }

      // Otherwise fetch from API
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          params: {
            offset: pageParam,
            limit: 10,
            telegram_id: telegramId,
            filter
          }
        }
      );

      // Cache first page results
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Invalidate cache when needed
  const invalidateCache = useCallback(() => {
    if (telegramId) {
      queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });
      localStorage.removeItem(`notifications_${telegramId}_${filter}`);
    }
  }, [telegramId, filter, queryClient]);

  return { ...query, invalidateCache };
}
