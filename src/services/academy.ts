// src/services/academy.ts
import { useQuery } from '@tanstack/react-query'
import type { AcademyData } from '@/pages/api/academy'

export async function fetchAcademy(telegramId: string): Promise<AcademyData> {
  const r = await fetch(`/api/academy?telegramId=${encodeURIComponent(telegramId)}`)
  if (!r.ok) throw new Error(await r.text())
  return (await r.json()).academy as AcademyData
}

export function useAcademyData(telegramId?: string) {
  return useQuery({
    queryKey: ['academy', telegramId],
    queryFn: () => fetchAcademy(telegramId!),
    enabled: !!telegramId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
  })
}
