/**
 * ProjectCard Component
 * بطاقة عرض مشروع Forex Utility
 */

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { componentVariants } from "@/shared/components/ui/variants";
import { cn } from "@/shared/utils";
import { animations } from "@/styles/animations";
import { colors } from "@/styles/tokens";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  downloadLink?: string;
  setupGuideLink?: string;
  index?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  icon,
  downloadLink,
  setupGuideLink,
  index = 0,
}) => {
  return (
    <motion.div {...animations.staggeredFadeIn(index)}>
      <Card
        className={cn(
          componentVariants.card.interactive,
          "group border-2 transition-all duration-300",
        )}
        style={{
          borderColor: colors.border.default,
          backgroundColor: colors.bg.elevated,
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200 flex items-center justify-center"
              style={{ backgroundColor: colors.brand.primary }}
            >
              {icon ? (
                <img
                  src={icon}
                  alt={title}
                  className="w-14 h-14 object-contain"
                />
              ) : (
                <div className="text-white text-2xl font-bold">
                  {title.charAt(0)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className="text-xl font-bold truncate"
                  style={{ color: colors.text.primary }}
                >
                  {title}
                </h3>
                <ChevronLeft
                  className="flex-shrink-0 w-5 h-5 transition-transform group-hover:-translate-x-1"
                  style={{ color: colors.text.tertiary }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: colors.text.secondary }}
              >
                {description}
              </p>

              {/* Action Links */}
              {(downloadLink || setupGuideLink) && (
                <div className="mt-4 flex gap-3 text-sm">
                  {downloadLink && (
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline transition"
                      style={{ color: colors.brand.primary }}
                    >
                      تحميل اللوحة
                    </a>
                  )}
                  {setupGuideLink && (
                    <a
                      href={setupGuideLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline transition"
                      style={{ color: colors.brand.primary }}
                    >
                      دليل التثبيت
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
