// src/pages/index.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, LayoutGrid } from "lucide-react";

import PageLayout from "@/shared/components/layout/PageLayout";
import { Button } from "@/shared/components/ui/button";
import { EmptyState, LottieAnimation, SectionHeading } from "@/shared/components/common";
import AcademyHeroCard from "@/domains/academy/components/AcademyHeroCard";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import { UserHeader, HomeSearchBar } from "@/domains/home/components";
import { HOME_SERVICES } from "@/domains/home/data/services";
import { ServiceCardV2 } from "@/shared/components/common/ServiceCardV2";
import { colors, semanticSpacing, spacing } from "@/styles/tokens";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services based on search
  const filteredServices = HOME_SERVICES.filter((service) =>
    searchQuery
      ? service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: colors.bg.secondary,
        minHeight: "100vh",
      }}
    >
      <UserHeader />

      <HomeSearchBar value={searchQuery} onChange={setSearchQuery} />

      <PageLayout maxWidth="2xl" showNavbar={false}>
        <div
          style={{
            display: "grid",
            gap: semanticSpacing.section.md,
            paddingTop: semanticSpacing.section.sm,
            paddingBottom: semanticSpacing.section.xl,
          }}
        >
          <section aria-labelledby="home-academy">
            <SectionHeading
              id="home-academy"
              title="أكاديمية إكسادو"
              icon={GraduationCap}
              action={
                <Button asChild intent="link" density="compact">
                  <Link href="/academy">عرض جميع الدروس</Link>
                </Button>
              }
            />
            <div
              style={{
                marginTop: spacing[4],
              }}
            >
              <AcademyHeroCard />
            </div>
          </section>

          <AuthPrompt />

          <section aria-labelledby="home-services">
            <SectionHeading
              id="home-services"
              title="خدمات إكسادو"
              icon={LayoutGrid}
              action={
                <Button asChild intent="link" density="compact">
                  <Link href="/shop">تصفح المتجر</Link>
                </Button>
              }
            />

            {filteredServices.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: spacing[6],
                  marginTop: spacing[4],
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                }}
              >
                {filteredServices.map((service) => (
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
                            width="80px"
                            height="80px"
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
          </section>
        </div>
      </PageLayout>
    </div>
  );
}
