// src/services/academy.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { AcademyData } from "@/pages/api/academy";
import {
  ACADEMY_CACHE_TTL,
  readCachedAcademy,
  writeCachedAcademy,
} from "@/domains/academy/cache/academyCache";

async function fetchAcademyFromNetwork(
  telegramId: string,
): Promise<AcademyData> {
  const response = await fetch(
    `/api/academy?telegramId=${encodeURIComponent(telegramId)}`,
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const payload = await response.json();
  return payload.academy as AcademyData;
}

export async function fetchAcademy(telegramId: string): Promise<AcademyData> {
  const fetchFresh = async () => {
    const fresh = await fetchAcademyFromNetwork(telegramId);
    if (typeof window !== "undefined") {
      await writeCachedAcademy(telegramId, fresh);
    }
    return fresh;
  };

  if (typeof window === "undefined") {
    return fetchFresh();
  }

  const cached = await readCachedAcademy(telegramId);
  if (cached && Date.now() - cached.updatedAt <= ACADEMY_CACHE_TTL) {
    void fetchFresh().catch((error) =>
      console.warn("[academy-cache] Background refresh failed", error),
    );
    return cached.data;
  }

  try {
    const fresh = await fetchFresh();
    return fresh;
  } catch (error) {
    if (cached) {
      console.warn(
        "[academy-cache] Using stale academy data after fetch failure",
        error,
      );
      return cached.data;
    }
    throw error;
  }
}

export function useAcademyData(telegramId?: string) {
  return useQuery({
    queryKey: ["academy", telegramId],
    queryFn: () => fetchAcademy(telegramId!),
    enabled: !!telegramId,
    staleTime: ACADEMY_CACHE_TTL,
    gcTime: 10 * 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
