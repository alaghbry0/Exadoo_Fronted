import { Skeleton } from "@/shared/components/ui/skeleton";
import { spacing } from "@/styles/tokens";

export function SkeletonLoader() {
  return (
    <div
      style={{
        display: "grid",
        gap: spacing[3],
        padding: spacing[4],
      }}
    >
      <Skeleton style={{ height: spacing[3], width: "75%" }} />
      <Skeleton style={{ height: spacing[3], width: "50%" }} />
      <Skeleton style={{ height: spacing[3], width: "100%" }} />
    </div>
  );
}
