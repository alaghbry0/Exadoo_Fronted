// src/components/AuroraBackground.tsx
"use client";
import { motion } from "framer-motion";

// ====================================================================
//  التعديل: تم استخراج الألوان بدقة من صورة الشعار
// ====================================================================
// اللون السماوي الأساسي من الشعار (Hex: #3899f2)
const PRIMARY_LOGO_COLOR = "rgba(50, 170, 242, 0.25)";

// لون سماوي ثانوي مائل للأخضر لإضافة عمق
const SECONDARY_CYAN_COLOR = "rgba(60, 153, 240, 0.2)";

// لون أزرق فاتح جداً للوهج والتأثيرات السحابية
const TERTIARY_HIGHLIGHT_COLOR = "rgba(204, 230, 255, 0.2)";

const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-white">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Gradient Blob 1 (لون الشعار الأساسي) */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full"
          style={{ background: PRIMARY_LOGO_COLOR, filter: "blur(100px)" }}
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        {/* Gradient Blob 2 (اللون الثانوي) */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
          style={{ background: SECONDARY_CYAN_COLOR, filter: "blur(100px)" }}
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["20%", "-20%", "20%"],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 5,
          }}
        />
        {/* Gradient Blob 3 (لون الوهج) */}
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full"
          style={{ background: TERTIARY_HIGHLIGHT_COLOR, filter: "blur(90px)" }}
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["-10%", "10%", "-10%"],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 10,
          }}
        />
      </motion.div>
    </div>
  );
};

export default AuroraBackground;
