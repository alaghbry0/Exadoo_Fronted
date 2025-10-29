import { useEffect, useRef } from "react";
import type { NextRouter } from "next/router";
import logger from "@/infrastructure/logging/logger";

const ROUTE_MAP: Record<string, string> = {
  shop: "/shop",
  plans: "/plans",
  profile: "/profile",
  notifications: "/notifications",
};

export type StartAppParam = string | null;

export function extractStartAppFromSearch(search: string): string | null {
  const sp = new URLSearchParams(search || "");
  return (
    sp.get("startapp") ||
    sp.get("tgWebAppStartParam") ||
    sp.get("start_param")
  );
}

export function readStartAppParam(): StartAppParam {
  const tg = (globalThis as any)?.Telegram?.WebApp;
  const tgParam =
    tg?.initDataUnsafe?.start_param ||
    tg?.initDataUnsafe?.startapp ||
    tg?.initData?.start_param;
  if (tgParam && typeof tgParam === "string") return tgParam;

  try {
    return extractStartAppFromSearch(globalThis.location?.search || "");
  } catch {
    return null;
  }
}

export function resolveTargetRoute(startParam: string): string | null {
  if (ROUTE_MAP[startParam]) return ROUTE_MAP[startParam];

  if (startParam.startsWith("route:")) {
    const raw = decodeURIComponent(startParam.slice("route:".length));
    if (raw.startsWith("/")) return raw;
  }

  const [name, qs] = startParam.split("?");
  if (ROUTE_MAP[name]) return qs ? `${ROUTE_MAP[name]}?${qs}` : ROUTE_MAP[name];

  return null;
}

interface UseStartAppNavigationOptions {
  router: NextRouter;
  isTelegramApp: boolean;
  isTelegramReady: boolean;
  showSplashScreen: boolean;
  stablePath: string;
}

export function useStartAppNavigation({
  router,
  isTelegramApp,
  isTelegramReady,
  showSplashScreen,
  stablePath,
}: UseStartAppNavigationOptions) {
  const didRouteRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let p = window.location.pathname || "/";
      if (!p.startsWith("/")) p = `/${p}`;
      if (p === "" || p === "/index" || p === "/index.html") p = "/";
      const finalUrl = p + window.location.search + window.location.hash;
      if (window.location.pathname !== p) {
        window.history.replaceState({}, "", finalUrl);
      }
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    if (didRouteRef.current) return;
    const ready = !showSplashScreen && (!isTelegramApp || isTelegramReady);
    if (!ready) return;

    const raw = readStartAppParam();
    if (!raw) return;

    const target = resolveTargetRoute(raw);
    if (!target) return;

    const targetPath = target.split("?")[0] || "/";
    if (stablePath === targetPath) {
      didRouteRef.current = true;
      return;
    }

    didRouteRef.current = true;
    router.replace(target).catch((err) => logger.error("Route replace failed", err));

    try {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } catch {
      /* no-op */
    }
  }, [isTelegramApp, isTelegramReady, showSplashScreen, router, stablePath]);
}
