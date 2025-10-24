/**
 * Indicators Page
 * تم تقسيم هذا الملف إلى مكونات منفصلة في src/features/indicators/
 */

import BackHeader from "@/components/BackHeader";
import { useTelegram } from "@/context/TelegramContext";
import { useIndicatorsData } from "@/services/indicators";
import { SubscribedView, PricingView } from "@/features/indicators/components";

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
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      <BackHeader backTo="/shop" backMode="always" />

      {isLoading && (
        <div 
          className="py-40 text-center"
          style={{ color: "var(--color-text-disabled)" }}
        >
          جاري التحميل...
        </div>
      )}
      
      {isError && (
        <div 
          className="py-40 text-center"
          style={{ color: "var(--color-error)" }}
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
