// src/services/indicators.ts
import { useQuery } from "@tanstack/react-query";
import type { IndicatorsData } from "@/pages/api/indicators";

export async function fetchIndicators(
  telegramId: string,
): Promise<IndicatorsData> {
  const r = await fetch(
    `/api/indicators?telegramId=${encodeURIComponent(telegramId)}`,
  );
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).indicators as IndicatorsData;
}

export function useIndicatorsData(telegramId?: string) {
  return useQuery({
    queryKey: ["indicators", telegramId],
    queryFn: () => fetchIndicators(telegramId!),
    enabled: !!telegramId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
