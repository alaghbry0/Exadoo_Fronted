// src/hooks/useNotificationStream.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '@/context/TelegramContext'; // تأكد من المسار
import { sseService } from '@/services/sseService'; // استيراد الخدمة الجديدة

export function useNotificationStream() {
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();

  useEffect(() => {
    // قم بتهيئة الخدمة بـ queryClient عند أول استخدام
    sseService.initialize(queryClient);

    if (telegramId) {
      // فقط أخبر الخدمة أن تتصل
      sseService.connect(telegramId);
    } else {
      // أو أن تقطع الاتصال إذا تم تسجيل الخروج
      sseService.disconnect();
    }

    // لا حاجة لدالة تنظيف هنا لأننا نريد الاتصال أن يستمر
    // طوال حياة التطبيق. الخدمة نفسها تدير قطع الاتصال.

  }, [telegramId, queryClient]);
}