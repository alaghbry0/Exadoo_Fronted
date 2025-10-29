/**
 * Indicators Page
 * تم تقسيم هذا الملف إلى مكونات منفصلة في src/features/indicators/
 */

import BackHeader from "@/shared/components/layout/BackHeader";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useIndicatorsData } from "@/domains/indicators/api";
import { SubscribedView, PricingView } from "@/domains/indicators/components";
import { colors } from "@/styles/tokens";

export default function IndicatorsPage() {
  const { telegramId } = useTelegram();
  const { data, isLoading, isError, error } = useIndicatorsData(
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
            جاري التحميل...
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
          <SubscribedView sub={data.my_subscription} />
        ) : (
          <PricingView data={data} />
        ))}
    </div>
  );
}
