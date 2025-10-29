/**
 * HeroSection Component
 * قسم البطل الرئيسي
 */

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { animations } from "@/styles/animations";
import { colors, gradients, withAlpha } from "@/styles/tokens";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-16 pb-20 text-center overflow-hidden">
      {/* Background decorations */}
        <div
          className="absolute -top-1/4 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: withAlpha(colors.brand.primary, 0.1) }}
        />
        <div
          className="absolute -bottom-1/4 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: withAlpha(colors.brand.secondary, 0.1) }}
        />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div {...animations.fadeInUp}>
            <Badge
              variant="outline"
              className="mb-4 backdrop-blur-sm border"
              style={{
                color: colors.brand.primary,
                borderColor: withAlpha(colors.brand.primary, 0.3),
                backgroundColor: withAlpha(colors.brand.primary, 0.12),
              }}
            >
              <Sparkles
                className="w-4 h-4 ml-2"
                style={{ color: colors.status.warning }}
              />
            لمنصات MT4 و MT5
          </Badge>
          
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight font-display"
              style={{ color: colors.text.primary }}
            >
            تداول أسرع، قرارات أذكى
          </h1>
          
            <motion.p
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
            تحكم كامل في صفقاتك مع لوحات Exaado. نفّذ أوامرك بنقرة واحدة، أدر
            مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.
          </motion.p>
          
          <motion.div {...animations.heroButton} className="mt-8">
              <Button
                density="relaxed"
                asChild
                className="rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1 group"
                style={{
                  background: gradients.brand.cta,
                  color: colors.text.inverse,
                }}
              >
              <a href="#plans">
                اختر خطتك الآن{" "}
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
