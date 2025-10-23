// src/services/sseService.ts

import { QueryClient } from "@tanstack/react-query";
import { showToast } from "@/components/ui/showToast"; // تأكد من أن هذا المسار صحيح
import type { NotificationType } from "@/types/notification"; // تأكد من أن هذا المسار صحيح

// ثوابت للتحكم في سلوك إعادة الاتصال
const RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 200000;

class SseService {
  private static instance: SseService;
  private eventSource: EventSource | null = null;
  private queryClient: QueryClient | null = null;
  private currentTelegramId: string | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): SseService {
    if (!SseService.instance) {
      SseService.instance = new SseService();
    }
    return SseService.instance;
  }

  public initialize(queryClient: QueryClient) {
    if (!this.queryClient) {
      console.log("🔌 SSE Service Initialized.");
      this.queryClient = queryClient;
    }
  }

  private cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log("🔌 SSE Service: Connection closed.");
    }
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
  }

  public connect(telegramId: string) {
    if (!this.queryClient) {
      return console.error(
        "SSE Service: Not initialized. Call initialize() first.",
      );
    }
    if (this.eventSource && this.currentTelegramId === telegramId) {
      return; // متصل بالفعل بنفس المستخدم
    }

    this.cleanup();
    this.currentTelegramId = telegramId;

    const sseUrl = `${process.env.NEXT_PUBLIC_BACKEND_SSE}/notifications/stream?telegram_id=${telegramId}`;
    console.log(`🔌 SSE Service: Connecting to user ${telegramId}...`);
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      console.log("✅ SSE Service: Connection Established!");
      this.resetHeartbeatTimeout();
    };

    this.eventSource.onerror = () => {
      this.cleanup();
      this.reconnectTimeout = setTimeout(
        () => this.connect(telegramId),
        RECONNECT_DELAY_MS,
      );
    };

    this.registerEventListeners();
  }

  public disconnect() {
    this.cleanup();
    this.currentTelegramId = null;
  }

  private resetHeartbeatTimeout = () => {
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
    this.heartbeatTimeout = setTimeout(() => {
      if (this.currentTelegramId) this.connect(this.currentTelegramId);
    }, HEARTBEAT_TIMEOUT_MS);
  };

  private registerEventListeners() {
    if (!this.eventSource || !this.queryClient) return;

    this.eventSource.addEventListener("new_notification", (event) => {
      this.resetHeartbeatTimeout();
      try {
        const notification = JSON.parse(event.data) as NotificationType;
        showToast.success({ message: ` ${notification.title}` });
        this.queryClient?.invalidateQueries({
          queryKey: ["notifications", this.currentTelegramId],
        });
        this.queryClient?.setQueryData<number>(
          ["unreadNotificationsCount", this.currentTelegramId],
          (count) => (count ?? 0) + 1,
        );
      } catch (e) {
        console.error("SSE new_notification error", e);
      }
    });

    this.eventSource.addEventListener("unread_update", (event) => {
      this.resetHeartbeatTimeout();
      try {
        const data = JSON.parse(event.data) as { count: number };
        this.queryClient?.setQueryData(
          ["unreadNotificationsCount", this.currentTelegramId],
          data.count,
        );
      } catch (e) {
        console.error("SSE unread_update error", e);
      }
    });

    this.eventSource.addEventListener("heartbeat", this.resetHeartbeatTimeout);
  }
}

export const sseService = SseService.getInstance();
