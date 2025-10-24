import { useMemo } from "react";
import { Sparkles } from "lucide-react";

import { ServiceCardV2 } from "@/shared/components/common/ServiceCardV2";
import { colors, radius, spacing } from "@/styles/tokens";
import { useTelegram } from "@/context/TelegramContext";
import { useIndicatorsData } from "@/services/indicators";
import { useUserStore } from "@/stores/zustand/userStore";

import type { ShopServiceMeta } from "../data/services";
import { LockedServiceCard } from "./LockedServiceCard";

interface ShopServiceCardProps {
  service: ShopServiceMeta;
}

export function ShopServiceCard({ service }: ShopServiceCardProps) {
  const { isLinked } = useUserStore();
  const { telegramId } = useTelegram();

  const indicatorsTelegramId = isLinked && telegramId ? telegramId : undefined;
  const { data: indicatorsData, isLoading } = useIndicatorsData(
    service.key === "indicators" ? indicatorsTelegramId : undefined,
  );

  const lifetime = useMemo(() => {
    if (service.key !== "indicators") {
      return undefined;
    }

    return indicatorsData?.subscriptions?.find(
      (plan: { duration_in_months?: string }) => plan?.duration_in_months === "0",
    );
  }, [indicatorsData, service.key]);

  const priceNow = lifetime?.discounted_price ?? lifetime?.price;
  const priceOld =
    lifetime?.discounted_price && lifetime?.discounted_price !== lifetime?.price
      ? lifetime?.price
      : undefined;

  const discount =
    priceOld && priceNow
      ? Math.round(
          ((Number(priceOld) - Number(priceNow)) / Number(priceOld)) * 100,
        )
      : undefined;

  const isLocked = service.key !== "signals" && !isLinked;

  const card = (
    <ServiceCardV2
      title={service.title}
      description={service.description}
      icon={service.icon}
      href={service.href}
      accent={service.accent}
      layout={service.layout}
      variant={service.variant}
      badge={service.isLive ? "Live" : service.badge}
      rightSlot={
        service.key === "indicators" ? (
          <IndicatorsPriceSummary
            isLoading={isLoading}
            priceNow={priceNow}
            priceOld={priceOld}
            discount={discount}
          />
        ) : undefined
      }
      prefetch={!isLocked}
    />
  );

  if (!isLocked) {
    return card;
  }

  return <LockedServiceCard isLocked>{card}</LockedServiceCard>;
}

interface IndicatorsPriceSummaryProps {
  isLoading: boolean;
  priceNow?: number | string | null;
  priceOld?: number | string | null;
  discount?: number;
}

function IndicatorsPriceSummary({
  isLoading,
  priceNow,
  priceOld,
  discount,
}: IndicatorsPriceSummaryProps) {
  if (isLoading) {
    return (
      <div
        style={{
          width: "6rem",
          height: "1.5rem",
          borderRadius: radius.lg,
          backgroundColor: colors.bg.tertiary,
        }}
        aria-hidden="true"
      />
    );
  }

  if (!priceNow) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: spacing[2],
          color: colors.text.secondary,
          fontSize: "0.875rem",
        }}
      >
        <Sparkles aria-hidden="true" size={16} />
        <span>اربط حسابك للاطلاع على الأسعار</span>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: spacing[2], minWidth: "8rem" }}>
      {discount ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: spacing[1],
            color: colors.status.success,
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          وفر {discount}%
        </span>
      ) : null}
      <div style={{ display: "flex", alignItems: "baseline", gap: spacing[2] }}>
        <span
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: colors.brand.primary,
            lineHeight: 1.2,
          }}
        >
          ${Number(priceNow).toFixed(0)}
        </span>
        {priceOld ? (
          <span
            style={{
              fontSize: "0.875rem",
              color: colors.text.tertiary,
              textDecoration: "line-through",
            }}
          >
            ${Number(priceOld).toFixed(0)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
