import { cn } from "@/shared/utils";
import { componentVariants, mergeVariants } from "@/shared/components/ui/variants";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Play, BookOpen } from "lucide-react";
import type { Course } from "@/domains/academy/types";
import { formatPrice } from "@/domains/academy/utils";

export default function StickyHeader({
  course,
  isEnrolled,
  visible,
  onCTA,
}: {
  course: Course;
  isEnrolled: boolean;
  visible: boolean;
  onCTA: () => void;
}) {
  const buttonText = isEnrolled
    ? "استمر في التعلم"
    : `اشترك - ${formatPrice(course.discounted_price || course.price)}`;
  const Icon = isEnrolled ? Play : ShoppingCart;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        componentVariants.card.base,
        "fixed top-0 left-0 right-0 z-50 /95 /95 backdrop-blur-xl /50 dark: /50",
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Course Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Course Image */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md relative">
              <Image
                src={course.thumbnail || course.cover_image || "/image.jpg"}
                alt={course.title}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                loading="lazy"
                quality={85}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base text-gray-900 dark:text-white truncate">
                {course.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                {typeof course.rating === "number" && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    {course.rating}
                  </span>
                )}
                {course.instructor_name && (
                  <span className="truncate">
                    بواسطة {course.instructor_name}
                  </span>
                )}
                {course.total_number_of_lessons && (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.total_number_of_lessons} درس
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCTA}
            className={`
              hidden sm:flex items-center justify-center gap-3 rounded-xl px-6 py-3 font-bold text-white 
              shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px]
              ${
                isEnrolled
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{buttonText}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
