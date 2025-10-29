"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { EmptyState, LottieAnimation } from "@/shared/components/common";
import { ServiceCardV2 } from "@/shared/components/common/ServiceCardV2";
import { Button } from "@/shared/components/ui/button";
import { HomeSection } from "@/domains/home/components/HomeSection";
import type { HomeServiceMeta } from "@/domains/home/data/services";
import { spacing } from "@/styles/tokens";

type HomeServicesSectionProps = {
  services: HomeServiceMeta[];
};

export function HomeServicesSection({ services }: HomeServicesSectionProps) {
  return (
    <HomeSection
      heading={{
        id: "home-services",
        title: "خدمات إكسادو",
        icon: LayoutGrid,
        action: (
          <Button asChild intent="link" density="compact">
            <Link href="/shop">تصفح المتجر</Link>
          </Button>
        ),
      }}
      contentSpacing="sm"
    >
      {services.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: spacing[5],
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {services.map((service) => (
            <ServiceCardV2
              key={service.key}
              title={service.title}
              description={service.description}
              href={service.href}
              accent={service.accent}
              ctaLabel={service.ctaLabel}
              layout="wide"
              rightSlot={
                service.animationData ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <LottieAnimation
                      animationData={service.animationData}
                      width="85px"
                      height="85px"
                      className="object-contain"
                    />
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div style={{ marginTop: spacing[6] }}>
          <EmptyState
            title="لا توجد خدمات مطابقة"
            description="جرّب البحث بكلمات مفتاحية مختلفة أو تصفح جميع خدماتنا."
          />
        </div>
      )}
    </HomeSection>
  );
}
