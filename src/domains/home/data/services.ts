// src/features/home/data/services.ts
import type { LucideIcon } from "lucide-react";

import type { ServiceCardAccent } from "@/shared/components/common/ServiceCardV2";

// Import animations
import signalsAnimation from "@/animations/signals.json";
import forexAnimation from "@/animations/forex.json";
import buyIndicatorAnimation from "@/animations/buy_indicator.json";

export interface HomeServiceMeta {
  key: string;
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  animationData?: any;
  accent?: ServiceCardAccent;
  ctaLabel?: string;
}

export const HOME_SERVICES: HomeServiceMeta[] = [
  {
    key: "signals",
    title: "Exaado Signals",
    description: "إشارات لحظية مدروسة تعزز قراراتك وتقلل الضوضاء.",
    href: "/shop/signals",
    animationData: signalsAnimation,
    accent: "primary",
    ctaLabel: "استكشف الإشارات",
  },
  {
    key: "forex",
    title: "Exaado Forex",
    description:  "تحكم كامل في صفقاتك مع لوحات Exaado للتداول. نفّذ أوامرك بنقرة واحدة، أدر مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.",
    href: "/forex",
    animationData: forexAnimation,
    accent: "secondary",
    ctaLabel: "ابدأ رحلة الفوركس",
  },
  {
    key: "indicators",
    title: "Exaado Buy Indicators",
    description: "حزمة مؤشرات متقدمة (Gann-based) بأداء مُثبت وتجربة سلسة.",
    href: "/indicators",
    animationData: buyIndicatorAnimation,
    accent: "success",
    ctaLabel: "تعرّف على المؤشرات",
  },
];
