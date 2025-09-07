// src/lib/startapp.ts
export type StartAppParam = string | null;

export function readStartAppParam(): StartAppParam {
  // 1) من Telegram WebApp
  const tg = window.Telegram?.WebApp;
  const fromTG =
    tg?.initDataUnsafe?.start_param ||
    tg?.initDataUnsafe?.startapp ||
    tg?.initData?.start_param;

  if (fromTG && typeof fromTG === 'string') return fromTG;

  // 2) كاختبار عبر المتصفح
  try {
    const sp = new URLSearchParams(globalThis.location?.search || '');
    return (
      sp.get('startapp') ||
      sp.get('tgWebAppStartParam') ||
      sp.get('start_param')
    );
  } catch {
    return null;
  }
}

// خريطة آمنة للأسماء المختصرة → مسارات التطبيق
export const ROUTE_MAP: Record<string, string> = {
  shop: '/shop',
  plans: '/plans',
  profile: '/profile',
  notifications: '/notifications',
};

// يحوّل القيمة لوجهة نهائية داخل Next.js
export function resolveTargetRoute(startParam: string): string | null {
  // دعم شكل مباشر: startapp=shop
  if (ROUTE_MAP[startParam]) return ROUTE_MAP[startParam];

  // دعم تمرير مسار صريح: startapp=route:/shop?plan=pro
  // (ننصح تستخدم هذا لو تبغى صفحة + كويري مرّة وحدة)
  if (startParam.startsWith('route:')) {
    const raw = decodeURIComponent(startParam.slice('route:'.length));
    // أمان بسيط: لازم يبدأ بشرطة مائلة
    if (raw.startsWith('/')) return raw;
  }

  // دعم شكل namespaced: shop?plan=pro  (يترجمه إلى /shop?plan=pro)
  const [name, qs] = startParam.split('?');
  if (ROUTE_MAP[name]) return qs ? `${ROUTE_MAP[name]}?${qs}` : ROUTE_MAP[name];

  return null;
}
