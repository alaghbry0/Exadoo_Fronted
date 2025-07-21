// hooks/useNotificationStream.ts (النسخة النهائية مع إعادة اتصال ذكية)

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '@/context/TelegramContext';
import { showToast } from '@/components/ui/Toast';
import type { NotificationType } from '@/types/notification';

// ثوابت للتحكم في سلوك إعادة الاتصال
const RECONNECT_DELAY_MS = 5000; // إعادة المحاولة كل 5 ثوانٍ
const HEARTBEAT_TIMEOUT_MS = 200000; // مهلة النبض (يجب أن تكون أكبر من فترة النبض في الخادم)

export function useNotificationStream() {
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // نستخدم useRef للاحتفاظ بالاتصال والمؤقتات لتجنب إعادة إنشائها مع كل re-render
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- دالة لإغلاق وتنظيف الاتصال الحالي ---
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // --- دالة إنشاء الاتصال ---
  const connect = useCallback(() => {
    if (!telegramId) {
      return;
    }

    // منع إنشاء اتصال جديد إذا كان هناك واحد بالفعل أو محاولة إعادة اتصال مجدولة
    if (eventSourceRef.current) return;
    cleanup(); // تنظيف أي حالة قديمة قبل البدء

    const sseUrl = `${process.env.NEXT_PUBLIC_BACKEND_SSE}/notifications/stream?telegram_id=${telegramId}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    console.log(`🔌 Attempting to establish SSE connection for user ${telegramId}...`);

    // دالة لإعادة ضبط مؤقت النبض، للتأكد من أن الاتصال لا يزال حيًا
    const resetHeartbeatTimeout = () => {
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ SSE connection stale (no heartbeat received). Reconnecting...');
        cleanup();
        connect(); // أعد الاتصال فورًا
      }, HEARTBEAT_TIMEOUT_MS);
    };

    es.onopen = () => {
      console.log('✅ SSE Connection Established!');
      setIsConnected(true);
      resetHeartbeatTimeout(); // ابدأ بمراقبة النبض
    };

    es.onerror = (error) => {
      console.error('❌ SSE Connection Error:', error);
      cleanup(); // نظف الاتصال الفاشل
      // جدولة محاولة إعادة اتصال بعد فترة
      console.log(`🔄 Scheduling SSE reconnection in ${RECONNECT_DELAY_MS / 1000} seconds...`);
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    // --- معالجة الأحداث الواردة من الخادم ---

    // 1. حدث الإشعار الجديد
    es.addEventListener('new_notification', (event) => {
      resetHeartbeatTimeout(); // أي رسالة تعني أن الاتصال حي
      try {
        const notificationData = JSON.parse(event.data) as NotificationType;
        console.log('📬 New Notification Received:', notificationData);
        showToast.success({ message: `إشعار جديد: ${notificationData.title}` });

        // تحديث شامل لكافة الإشعارات لضمان ظهور الجديد
        queryClient.invalidateQueries({ queryKey: ['notifications', telegramId] });

        if (notificationData.type === 'subscription_renewal') {
          queryClient.invalidateQueries({ queryKey: ['subscriptions', telegramId] });
        }
      } catch (e) {
        console.error('Error parsing new_notification event:', e);
      }
    });

    // 2. حدث تحديث عدد غير المقروء
    es.addEventListener('unread_update', (event) => {
      resetHeartbeatTimeout(); // أي رسالة تعني أن الاتصال حي
      try {
        const data = JSON.parse(event.data) as { count: number };
        console.log(`🔄 Unread Count Updated: ${data.count}`);
        // invalidateQueries هو الخيار الأفضل لأنه يطلب تحديثًا من الخادم
        // ويتجنب التعارض مع التحديثات المتفائلة (optimistic updates)
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', telegramId] });
      } catch (e) {
        console.error('Error parsing unread_update event:', e);
      }
    });

    // 3. ✨ حدث النبض (الجديد)
    es.addEventListener('heartbeat', () => {
      // console.log('💓 Heartbeat received');
      resetHeartbeatTimeout(); // فقط أعد تعيين المؤقت، لا تفعل شيئًا آخر
    });

  }, [telegramId, queryClient, cleanup]);


  // --- إدارة دورة حياة الاتصال ---
  useEffect(() => {
    if (telegramId) {
      connect();
    } else {
      cleanup();
    }

    // دالة التنظيف النهائية عند إلغاء تحميل المكون
    return () => {
      console.log("🧹 Unmounting component, cleaning up SSE connection.");
      cleanup();
    };
  }, [telegramId, connect, cleanup]);

  return { isConnected };
}