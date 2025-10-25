// src/components/academy/CategoryCard.tsx
import { memo } from "react";
import Link from "next/link";
import SmartImage from "@/shared/components/common/SmartImage";
import { motion } from "framer-motion";

interface CategoryCardProps {
  id: string;
  name: string;
  thumbnail?: string;
  priority?: boolean;
}

export const CategoryCard = memo(function CategoryCard({
  id,
  name,
  thumbnail,
  priority,
}: CategoryCardProps) {
  return (
    <Link href={`/academy/category/${id}`} prefetch>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer w-[160px] sm:w-[180px] flex-shrink-0"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
          {/* Background Image */}
          <div className="relative h-32 sm:h-36 overflow-hidden">
            <SmartImage
              src={thumbnail || "/image.jpg"}
              alt={name}
              fill
              blurType="secondary"
              className="object-cover"
              sizes="(max-width: 640px) 160px, 180px"
              priority={!!priority}
              lazy={!priority}
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          
          {/* Category Name */}
          <div className="bg-white py-2.5 px-2">
            <p 
              className="text-center text-xs sm:text-sm font-bold text-gray-900 truncate" 
              style={{ fontFamily: 'var(--font-arabic)' }}
              title={name}
            >
              {name}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
