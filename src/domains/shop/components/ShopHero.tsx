import { motion } from "framer-motion";

import { animations } from "@/styles/animations";
import { colors, semanticSpacing, spacing, typography } from "@/styles/tokens";

export function ShopHero() {
  return (
    <motion.section
      {...animations.slideUp}
      style={{
        textAlign: "center",
        paddingTop: semanticSpacing.section.lg,
        paddingBottom: semanticSpacing.section.md,
        display: "grid",
        gap: spacing[4],
      }}
      aria-labelledby="shop-page-title"
    >
      <header>
        <h1
          id="shop-page-title"
          className={typography.display.md}
          style={{ color: colors.text.primary }}
        >
          متجر Exaado
        </h1>
      </header>
      <p
        className={typography.body.lg}
        style={{
          color: colors.text.secondary,
          maxWidth: "48ch",
          margin: "0 auto",
        }}
      >
        أدواتك وخدماتك للوصول إلى مستوى جديد في عالم التداول. استكشف، تعلم،
        ونفّذ بثقة.
      </p>
    </motion.section>
  );
}
