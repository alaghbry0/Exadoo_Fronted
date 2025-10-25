// src/components/academy/LatestCourseCard.tsx
import { memo } from "react";
import Link from "next/link";
import SmartImage from "@/shared/components/common/SmartImage";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { colors } from "@/styles/tokens";

interface LatestCourseCardProps {
  id: string;
  title: string;
  lessonsCount: number;
  imageUrl: string;
  price: string;
  instructorName?: string;
  rating?: number;
  priority?: boolean;
}

// Format price
const formatPrice = (value: string) => {
  if (!value) return "";
  const n = Number(value);
  return isNaN(n) ? value : `${n.toFixed(0)} USDT`;
};

export const LatestCourseCard = memo(function LatestCourseCard({
  id,
  title,
  lessonsCount,
  imageUrl,
  price,
  instructorName = "Instructor",
  rating = 0,
  priority,
}: LatestCourseCardProps) {
  // Render stars
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={14}
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        aria-hidden="true"
      />
    ));
  };

  return (
    <Link href={`/academy/course/${id}`} prefetch>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer w-[240px] sm:w-[260px] flex-shrink-0"
      >
        <div className="overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col" style={{ minHeight: '320px', maxHeight: '320px' }}>
          {/* Banner Image */}
          <div className="relative h-40">
            <SmartImage
              src={imageUrl || "/image.jpg"}
              alt={title}
              fill
              blurType="secondary"
              className="object-cover"
              sizes="(max-width: 640px) 240px, 260px"
              priority={!!priority}
              lazy={!priority}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Lessons Badge */}
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold">
              {lessonsCount} lessons
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3 flex flex-col flex-grow">
            {/* Title */}
            <h3 
              className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight"
              style={{ fontFamily: 'var(--font-arabic)' }}
              title={title}
            >
              {title}
            </h3>
            
            {/* Instructor */}
            <p className="text-xs text-gray-500 mb-1.5">
              {instructorName}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {renderStars()}
            </div>
            
            {/* Footer: Price + Cart */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-auto">
              <span className="text-base font-bold" style={{ color: colors.text.primary }}>
                {formatPrice(price)}
              </span>
              <button
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // Add to cart logic
                }}
                aria-label="إضافة إلى السلة"
              >
                <ShoppingCart size={18} className="text-blue-600" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});