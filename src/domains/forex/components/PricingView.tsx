/**
 * PricingView Component
 * واجهة عرض الأسعار والخطط - مبسطة
 */

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import TradingPanelPurchaseModal from "@/domains/payments/components/TradingPanelPurchaseModal";
import { LottieAnimation } from "@/shared/components/common/LottieAnimation";
import { FeatureCard } from "./FeatureCard";
import { PlanCard } from "./PlanCard";
import { FAQSection } from "./FAQSection";
import { animations } from "@/styles/animations";
import type { ForexData } from "@/pages/api/forex";
import forexAnimation from "@/animations/forex_2.json";

interface PricingViewProps {
  data: ForexData;
}

export const PricingView: React.FC<PricingViewProps> = ({ data }) => {
  // فرز الخطط لعرض خطة مدى الحياة بشكل مميز
  const plans = data.subscriptions ?? [];
  const lifetimePlan = plans.find((p) => p.duration_in_months === "0");
  const otherPlans = plans
    .filter((p) => p.duration_in_months !== "0")
    .sort((a, b) => Number(a.price) - Number(b.price));
  const allPlans = [...otherPlans, ...(lifetimePlan ? [lifetimePlan] : [])];

  const features = [
    {
      icon: Zap,
      title: "تنفيذ فوري",
      description: "فتح وإغلاق الصفقات بنقرة واحدة، أسرع من أي وقت مضى.",
    },
    {
      icon: ShieldCheck,
      title: "إدارة المخاطر",
      description: "حساب حجم اللوت تلقائيًا وتحديد وقف الخسارة والربح بسهولة.",
    },
    {
      icon: Award,
      title: "واجهة احترافية",
      description: "تصميم نظيف وسهل الاستخدام متوافق مع MT4 و MT5.",
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
            animationData={forexAnimation}
            width="100%"
            height={350}
            className="max-w-md"
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
            Our Forex Utility Projects !
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-arabic)",
            }}
          >
            Choose between a variety of projects provided by Exaado!
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
              className="text-3xl font-extrabold"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-arabic)",
              }}
            >
              اختر الخطة التي تناسبك
            </h2>
            <p
              className="mt-2"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-arabic)",
              }}
            >
              ابدأ تجربتك المجانية أو احصل على وصول كامل اليوم.
            </p>
          </div>

          {allPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {allPlans.map((p) => (
                <PlanCard key={p.id} plan={p} />
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border-dashed sm:col-span-3">
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
      <TradingPanelPurchaseModal />
    </main>
  );
};
