/**
 * HeroSection Component
 * قسم البطل الرئيسي
 */

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { forexAnimations } from "../animations";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-16 pb-20 text-center overflow-hidden">
      {/* Background decorations */}
      <div 
        className="absolute -top-1/4 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: "rgba(var(--color-primary-400-rgb, 96, 165, 250), 0.1)" }}
      />
      <div 
        className="absolute -bottom-1/4 -left-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: "rgba(var(--color-secondary-400-rgb, 251, 146, 60), 0.1)" }}
      />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div {...forexAnimations.fadeInUp}>
          <Badge
            variant="outline"
            className="mb-4 backdrop-blur-sm border"
            style={{
              color: "var(--color-primary-500)",
              borderColor: "rgba(var(--color-primary-500-rgb, 59, 130, 246), 0.3)",
              backgroundColor: "rgba(var(--color-primary-50-rgb, 239, 246, 255), 0.5)",
            }}
          >
            <Sparkles 
              className="w-4 h-4 ml-2"
              style={{ color: "var(--color-warning-500)" }}
            />
            لمنصات MT4 و MT5
          </Badge>
          
          <h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight font-display"
            style={{ color: "var(--color-text-primary)" }}
          >
            تداول أسرع، قرارات أذكى
          </h1>
          
          <motion.p
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            تحكم كامل في صفقاتك مع لوحات Exaado. نفّذ أوامرك بنقرة واحدة، أدر
            مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.
          </motion.p>
          
          <motion.div {...forexAnimations.heroButton} className="mt-8">
            <Button
              size="lg"
              asChild
              className="rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1 group"
              style={{
                background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))",
                color: "white",
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
