// hooks/useNotifications.ts (النسخة النهائية المبسطة)

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
// تأكد من أن هذا المسار صحيح وأن الملف يحتوي على تعريف لنوع NotificationData
import type { NotificationType } from '@/types/notification';

/**
 * Hook مخصص لجلب الإشعارات مع التمرير اللانهائي (Infinite Scrolling).
 * يعتمد بشكل كامل على React Query للتخزين المؤقت وإدارة الحالة.
 *
 * @param telegramId - معرف المستخدم في تيليجرام. يتم تعطيل الاستعلام إذا كان null.
 * @param filter - فلتر لعرض الإشعارات 'all' (الكل) أو 'unread' (غير المقروءة).
 * @returns كائن الاستعلام من useInfiniteQuery.
 */
export function useNotifications(telegramId: string | null, filter: 'all' | 'unread' = 'all') {
  const query = useInfiniteQuery<NotificationType[], Error>({
    // مفتاح الاستعلام يتضمن المعرف والفلتر لضمان تخزين البيانات بشكل فريد
    queryKey: ['notifications', telegramId, filter],

    // الدالة المسؤولة عن جلب البيانات
    queryFn: async ({ pageParam = 0 }) => {
      // لا تقم بإرسال الطلب إذا لم يكن telegramId متوفرًا
      if (!telegramId) return [];

      const { data } = await axios.get(
        // استخدام متغير البيئة الجديد للرابط
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`,
        {
          params: {
            offset: pageParam,
            limit: 10, // جلب 10 إشعارات في كل مرة
            telegram_id: telegramId,
            filter,
          },
        }
      );
      return data;
    },

    // الصفحة الأولية تبدأ من offset 0
    initialPageParam: 0,

    // تحديد كيفية الحصول على رقم الصفحة التالية
    getNextPageParam: (lastPage, allPages) => {
      // إذا كانت الصفحة الأخيرة التي تم جلبها تحتوي على 10 عناصر،
      // فهذا يعني أنه من المحتمل وجود صفحات أخرى.
      // نرجع الـ offset الجديد الذي هو عدد كل العناصر التي تم جلبها حتى الآن.
      return lastPage.length === 10 ? allPages.flat().length : undefined;
    },

    // تفعيل الاستعلام فقط عند وجود telegramId
    enabled: !!telegramId,

    // اعتبار البيانات قديمة بعد دقيقة واحدة، مما يعني أن أي طلب جديد خلال هذه الدقيقة سيستخدم الكاش
    staleTime: 1 * 60 * 1000, // دقيقة واحدة
  });

  // إعادة كائن الاستعلام مباشرة. لم تعد هناك حاجة لـ invalidateCache.
  return query;
}
