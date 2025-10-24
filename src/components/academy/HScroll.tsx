// src/components/academy/HScroll.tsx
import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface HScrollProps extends React.PropsWithChildren {
  itemClassName?: string;
}

export const HScroll = memo(function HScroll({
  children,
  itemClassName = "min-w-[220px] w-[68%] xs:w-[58%] sm:w-[45%] lg:w-[30%] xl:w-[23%]",
}: HScrollProps) {
  const count = React.Children.count(children);
  if (count === 0) return null;

  return (
    <div className="relative mx-0 sm:-mx-4 px-0 sm:px-4">
      <div className="hscroll hscroll-snap">
        {React.Children.map(children, (child, i) => (
          <div key={i} className={cn("hscroll-item", itemClassName)}>
            {child}
          </div>
        ))}
        <div className="hscroll-item w-px sm:w-2 lg:w-4" />
      </div>
    </div>
  );
});
