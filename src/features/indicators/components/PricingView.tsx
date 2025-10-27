/**
 * PricingView Component
 * واجهة عرض الأسعار والخطط - مبسطة
 */

import { motion } from "framer-motion";
import { Zap, Award, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AuthPrompt from "@/features/auth/components/AuthFab";
import IndicatorsPurchaseModal from "@/components/IndicatorsPurchaseModal";
import { LottieAnimation } from "@/components/common/LottieAnimation";
import { FeatureCard } from "./FeatureCard";
import { PlanCard } from "./PlanCard";
import { FAQSection } from "./FAQSection";
import { animations } from "@/styles/animations";
import type { IndicatorsData } from "@/pages/api/indicators";
import indicatorAnimation from "@/animations/buy_indicator.json";

interface PricingViewProps {
  data: IndicatorsData;
}

export const PricingView: React.FC<PricingViewProps> = ({ data }) => {
  const lifetimePlan = data.subscriptions?.find(
    (p) => p.duration_in_months === "0",
  );

  // التأكد من أن الخطة المميزة تأتي أولاً إذا لم تكن مدى الحياة
  const otherPlans = (data.subscriptions ?? [])
    .filter((p) => p.duration_in_months !== "0")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  // دمج الخطط للعرض
  const allPlans = [...otherPlans, ...(lifetimePlan ? [lifetimePlan] : [])];

  const features = [
    {
      icon: Zap,
      title: "إشارات دقيقة",
      description: "إشارات بيع وشراء مبنية على نظريات Gann لتحقيق أقصى دقة.",
    },
    {
      icon: Award,
      title: "لا تعيد رسم نفسها",
      description: "جميع مؤشراتنا Non-Repainting لضمان الموثوقية الكاملة.",
    },
    {
      icon: Settings,
      title: "إعدادات قابلة للتخصيص",
      description: "تحكم كامل في إعدادات المؤشر لتناسب استراتيجيتك الخاصة.",
    },
  ];

  return (
    <main
      className="pb-12"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Lottie Animation */}
        <motion.div
          {...animations.fadeInUp}
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
          {...animations.fadeInUp}
          className="text-center mb-12"
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
      </div>

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section
        id="plans"
        className="py-16 border-y"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border-default)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-extrabold font-display"
              style={{ color: "var(--color-text-primary)" }}
            >
              اختر الخطة التي تناسبك
            </h2>
            <p 
              className="mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              جميع الخطط تمنحك وصولاً كاملاً لجميع الميزات والتحديثات.
            </p>
          </div>
          
          {allPlans.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {allPlans.map((p) => (
                <PlanCard key={p.id} plan={p} />
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border-dashed lg:col-span-3">
              <CardContent 
                className="p-8 text-center"
                style={{ color: "var(--color-text-disabled)" }}
              >
                لا توجد خطط متاحة حاليًا.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Modals & Floating Actions */}
      <AuthPrompt />
      <IndicatorsPurchaseModal />
    </main>
  );
};
