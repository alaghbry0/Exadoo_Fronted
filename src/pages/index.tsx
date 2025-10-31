// src/pages/index.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap } from "lucide-react";

import PageLayout from "@/shared/components/layout/PageLayout";
import { Button } from "@/shared/components/ui/button";
import AcademyHeroCard from "@/domains/academy/components/AcademyHeroCard";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import {
  UserHeader,
  HomeSearchBar,
  HomeSection,
  HomeServicesSection,
} from "@/domains/home/components";
import { HOME_SERVICES } from "@/domains/home/data/services";
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
    <div dir="rtl" style={{ backgroundColor: colors.bg.secondary, minHeight: "80vh" }}>
      <UserHeader />
      <HomeSearchBar value={searchQuery} onChange={setSearchQuery} />
      
      <PageLayout
        dir="rtl"
        maxWidth="2xl"
        showNavbar={false}
        style={{ backgroundColor: colors.bg.secondary }}
        mainProps={{ dir: "rtl" }}
        mainStyle={{
          backgroundColor: colors.bg.secondary,
          paddingTop: spacing[0],
          paddingBottom: semanticSpacing.section.md,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: semanticSpacing.section.md,
          }}
        >
          

          <HomeSection
            heading={{
              id: "home-academy",
              title: "أكاديمية إكسادو",
              icon: GraduationCap,
              action: (
                <Button asChild intent="link" density="compact">
                  <Link href="/academy">عرض جميع الدروس</Link>
                </Button>
              ),
            }}
          >
            <AcademyHeroCard />
          </HomeSection>

          <AuthPrompt />

          <HomeServicesSection services={filteredServices} />
        </div>
      </PageLayout>
    </div>
  );
}
