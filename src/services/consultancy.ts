import { useQuery } from "@tanstack/react-query";
import type { ConsultancyData } from "@/pages/api/consultancy";

export async function fetchConsultancy(
  telegramId: string,
): Promise<ConsultancyData> {
  const r = await fetch(
    `/api/consultancy?telegramId=${encodeURIComponent(telegramId)}`,
  );
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).consultancy as ConsultancyData;
}

export function useConsultancyData(telegramId?: string) {
  return useQuery({
    queryKey: ["consultancy", telegramId],
    queryFn: () => fetchConsultancy(telegramId!),
    enabled: !!telegramId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  });
}
