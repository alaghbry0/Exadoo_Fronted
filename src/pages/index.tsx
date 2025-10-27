// src/pages/index.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/shared/components/layout/PageLayout";
import AcademyHeroCard from "@/components/AcademyHeroCard";
import AuthPrompt from "@/features/auth/components/AuthFab";
import {
  UserHeader,
  HomeSearchBar,
  HomeServiceCard,
} from "@/features/home/components";
import { HOME_SERVICES } from "@/features/home/data/services";
import { colors, spacing } from "@/styles/tokens";

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
      className="min-h-screen pb-20"
      style={{ backgroundColor: colors.bg.secondary }}
    >
      {/* Header */}
      <UserHeader />

      {/* Search Bar */}
      <HomeSearchBar value={searchQuery} onChange={setSearchQuery} />

      <PageLayout maxWidth="2xl">
        <div
          style={{
            display: "grid",
            gap: spacing[8],
            paddingTop: spacing[6],
          }}
        >
          {/* Exaado Academy Section */}
          <section aria-labelledby="academy-section">
            <div
              className="flex items-center justify-between mb-4 px-4"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              <h2
                id="academy-section"
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Exaado Academy
              </h2>
              <a
                href="/academy"
                className="text-sm font-semibold hover:underline"
                style={{ color: colors.brand.primary }}
              >
                View All →
              </a>
            </div>
            <div className="px-1">
              <AcademyHeroCard />
            </div>
          </section>

          {/* Exaado Services Section */}
          <section aria-labelledby="services-section">
            <div className="px-2 mb-2">
              <h2
                id="services-section"
                className="text-2xl font-bold"
                style={{
                  color: colors.text.primary,
                  fontFamily: "var(--font-arabic)",
                }}
              >
                Exaado Services
              </h2>
            </div>

            {filteredServices.length > 0 ? (
              <div className="px-4">
                {/* First Row: Signals and Forex */}
                <div
                  className="mb-4"
                  style={{
                    display: "grid",
                    gap: spacing[4],
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  {filteredServices
                    .filter((service) => 
                      service.key === "signals" || service.key === "forex"
                    )
                    .map((service) => (
                      <HomeServiceCard
                        key={service.key}
                        title={service.title}
                        description={service.description}
                        href={service.href}
                        animationData={service.animationData}
                        icon={service.icon}
                      />
                    ))}
                </div>
                
                {/* Second Row: Buy Indicators */}
                <div>
                  {filteredServices
                    .filter((service) => service.key === "indicators")
                    .map((service) => (
                      <HomeServiceCard
                        key={service.key}
                        title={service.title}
                        description={service.description}
                        href={service.href}
                        animationData={service.animationData}
                        icon={service.icon}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <div
                className="text-center py-12 px-4"
                style={{ color: colors.text.secondary }}
              >
                <p>لا توجد خدمات تطابق البحث</p>
              </div>
            )}
          </section>

          {/* Auth Prompt */}
          <div className="px-4">
            <AuthPrompt />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
