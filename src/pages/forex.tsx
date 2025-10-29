// src/pages/forex.tsx
"use client";
import BackHeader from "@/shared/components/layout/BackHeader";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useForexData } from "@/domains/forex/api";
import { SubscribedView, PricingView } from "@/domains/forex/components";
import type { MyForexSubscription } from "@/pages/api/forex";
import { colors } from "@/styles/tokens";

/* ===========================
   Main Page Component (Unchanged Logic)
=========================== */
export default function ForexPage() {
  const { telegramId } = useTelegram();
  const { data, isLoading, isError, error } = useForexData(
    telegramId || undefined,
  );

    return (
      <div
        dir="rtl"
        className="min-h-screen font-arabic"
        style={{
          backgroundColor: colors.bg.primary,
          color: colors.text.primary,
        }}
      >
      <BackHeader backTo="/shop" backMode="always" />

        {isLoading && (
          <div
            className="py-40 text-center"
            style={{ color: colors.text.disabled }}
          >
            ...جاري التحميل
          </div>
        )}
        {isError && (
          <div
            className="py-40 text-center"
            style={{ color: colors.status.error }}
          >
            تعذر تحميل البيانات: {(error as Error)?.message}
          </div>
        )}

      {!isLoading &&
        !isError &&
        data &&
        (data.my_subscription ? (
          <SubscribedView sub={data.my_subscription as MyForexSubscription} />
        ) : (
          <PricingView data={data} />
        ))}
    </div>
  );
}

(ForexPage as any).hideFooter = true;
