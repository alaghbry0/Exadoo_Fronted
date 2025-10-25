/**
 * SubscribedView Component
 * واجهة المستخدم المشترك - عرض معلومات الاشتراك
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { LottieAnimation } from "./LottieAnimation";
import { SubscriptionCard } from "./SubscriptionCard";
import { indicatorsAnimations } from "../animations";
import type { IndicatorsData } from "@/pages/api/indicators";
import indicatorAnimation from "@/animations/buy_indicator.json";

interface SubscribedViewProps {
  sub: NonNullable<IndicatorsData["my_subscription"]>;
}

export const SubscribedView: React.FC<SubscribedViewProps> = ({ sub }) => {
  const startDate = useMemo(() => {
    const date = new Date(Number(sub.date_added) * 1000);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [sub.date_added]);

  const isLifetime = sub.status === "lifetime";

  return (
    <main
      className="min-h-screen pb-24 pt-8"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Lottie Animation */}
        <motion.div
          {...indicatorsAnimations.fadeInUp}
          className="flex justify-center mb-8"
        >
          <LottieAnimation
            animationData={indicatorAnimation}
            width="100%"
            height={300}
            className="max-w-sm"
          />
        </motion.div>

        {/* Header */}
        <motion.div
          {...indicatorsAnimations.fadeInUp}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-arabic)",
            }}
          >
            Gann Tool Subscriptions
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-arabic)",
              lineHeight: "1.8",
            }}
          >
            أول وأفضل مؤشر في الوطن العربي لرسم مربع 9 ومربع 144 ومربع 52 🔥
            والجمعة السادسة وأغلب علوم جان
          </p>
        </motion.div>

        {/* Subscription Card */}
        <SubscriptionCard
          planName={isLifetime ? "Lifetime Subscription" : sub.status}
          planStatus="Lifetime Access"
          startDate={startDate}
          tradingViewId={sub.trading_view_id}
          icon="/indicator.png"
        />
      </div>
    </main>
  );
};
