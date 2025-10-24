import { spacing } from "@/styles/tokens";

import type { ShopServiceMeta } from "../data/services";
import { ShopServiceCard } from "./ShopServiceCard";

interface ShopServicesGridProps {
  services: ShopServiceMeta[];
}

export function ShopServicesGrid({ services }: ShopServicesGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: spacing[5],
        gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
      }}
    >
      {services.map((service) => (
        <div
          key={service.key}
          style={
            service.layout === "wide"
              ? { gridColumn: "1 / -1" }
              : undefined
          }
        >
          <ShopServiceCard service={service} />
        </div>
      ))}
    </div>
  );
}
