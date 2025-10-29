import { cn } from "@/shared/utils";
import { animations, colors, radius } from "@/styles/tokens";

function Skeleton({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(animations.presets.pulse, className)}
      style={{
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.md,
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
