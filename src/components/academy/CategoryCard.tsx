// src/components/academy/CategoryCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import SmartImage from "@/shared/components/common/SmartImage";
import { cardHoverVariant } from "./animation-variants";

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
    <Link
      href={`/academy/category/${id}`}
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div {...cardHoverVariant}>
        <div
          className={cn(
            componentVariants.card.base,
            componentVariants.card.elevated,
            componentVariants.card.interactive,
            "relative h-full min-h-[130px] sm:min-h-[180px] overflow-hidden rounded-3xl",
          )}
        >
          <SmartImage
            src={thumbnail || "/image.jpg"}
            alt={`تصنيف: ${name}`}
            fill
            blurType="secondary"
            sizes="(min-width:1024px) 22vw, (min-width:640px) 38vw, 50vw"
            priority={!!priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ borderRadius: "0 0 0rem 0rem" }}
            noFade
            disableSkeleton
            eager
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-sm">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-white tracking-wide">
                {name}
              </h3>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
