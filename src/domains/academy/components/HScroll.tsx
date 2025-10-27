/**
 * Horizontal Scroll Container
 * حاوية تمرير أفقي للعناصر
 */

import React from "react";
import { cn } from "@/shared/utils";

interface HScrollProps {
  children: React.ReactNode;
  itemClassName?: string;
}

/**
 * مكون تمرير أفقي مُحسّن للجوال
 */
export const HScroll: React.FC<HScrollProps> = ({
  children,
  itemClassName = "min-w-[220px] w-[68%] xs:w-[58%] sm:w-[45%] lg:w-[30%] xl:w-[23%]",
}) => {
  const count = React.Children.count(children);

  if (count === 0) return null;

  return (
    <div className="relative -mx-4 px-4">
      <div
        className="hscroll hscroll-snap"
        role="list"
        aria-label="قائمة أفقية قابلة للتمرير"
      >
        {React.Children.map(children, (ch, i) => (
          <div
            key={i}
            className={cn("hscroll-item", itemClassName)}
            role="listitem"
          >
            {ch}
          </div>
        ))}
        <div className="hscroll-item w-px sm:w-2 lg:w-4" />
      </div>
    </div>
  );
};
