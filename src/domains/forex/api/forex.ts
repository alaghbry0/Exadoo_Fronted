import { useQuery } from "@tanstack/react-query";
import type { ForexData } from "@/pages/api/forex";

export async function fetchForex(telegramId: string): Promise<ForexData> {
  const r = await fetch(
    `/api/forex?telegramId=${encodeURIComponent(telegramId)}`,
  );
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).forex as ForexData;
}

export function useForexData(telegramId?: string) {
  return useQuery({
    queryKey: ["forex", telegramId],
    queryFn: () => fetchForex(telegramId!),
    enabled: !!telegramId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
