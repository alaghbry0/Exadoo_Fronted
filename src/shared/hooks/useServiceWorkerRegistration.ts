import { useEffect } from "react";
import logger from "@/infrastructure/logging/logger";
import { registerServiceWorker } from "@/infrastructure/serviceWorker/registerServiceWorker";

export function useServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    registerServiceWorker().catch((err) => {
      logger.error("Service Worker registration failed", err);
    });
  }, []);
}
