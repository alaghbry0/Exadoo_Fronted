// src/hooks/useUnifiedSearch.ts
import { useDeferredValue, useMemo } from 'react';
import { unifiedSearch, type UnifiedResult } from '@/lib/search/unified';

type ServiceMeta = { key: string; title: string; description: string; href: string };

export function useUnifiedSearchHook(params: {
  query: string;
  services: ServiceMeta[];
  academyData:
    | {
        courses?: any[];
        bundles?: any[];
        categories?: any[];
      }
    | null
    | undefined;
  isLinked?: boolean; // لتحديد Lock للخدمات
  perSectionLimit?: number;
}) {
  const dq = useDeferredValue(params.query);

  const result: UnifiedResult = useMemo(() => {
    return unifiedSearch(
      dq,
      params.services,
      params.academyData,
      {
        perSectionLimit: params.perSectionLimit ?? 8,
        lockResolver: (key) => {
          // نفس منطقك الحالي: الخدمات غير Signals تتطلب ربط
          if (key === 'signals') return false;
          return !params.isLinked;
        },
      }
    );
  }, [dq, params.services, params.academyData, params.isLinked, params.perSectionLimit]);

  const isSearching = !!dq.trim();

  return { result, isSearching };
}
