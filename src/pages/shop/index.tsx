"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

import PageLayout from "@/shared/components/layout/PageLayout";
import AuthPrompt from "@/domains/auth/components/AuthFab";
import AcademyHeroCard from "@/domains/academy/components/AcademyHeroCard";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useAcademyData } from "@/domains/academy/api";
import { useUnifiedSearchHook } from "@/domains/shop/hooks/useUnifiedSearch";
import { useKeyboardSearch } from "@/domains/shop/hooks/useKeyboardSearch";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useUserStore } from "@/shared/state/zustand/userStore";
import { animations } from "@/styles/animations";
import { colors, semanticSpacing, spacing } from "@/styles/tokens";

import { LockedServiceCard } from "@/domains/shop/components/LockedServiceCard";
import { ShopHero } from "@/domains/shop/components/ShopHero";
import { ShopSearchBar } from "@/domains/shop/components/ShopSearchBar";
import { ShopSearchResults } from "@/domains/shop/components/ShopSearchResults";
import { ShopSectionHeading } from "@/domains/shop/components/ShopSectionHeading";
import { ShopServicesGrid } from "@/domains/shop/components/ShopServicesGrid";
import { SHOP_SERVICES } from "@/domains/shop/data/services";

export default function ShopHome() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  const { isLinked } = useUserStore();
  const { telegramId } = useTelegram();
  const { data: academyData } = useAcademyData(telegramId || undefined);

  useKeyboardSearch({ inputRef, query, onClear: () => setQuery("") });

  const { result, isSearching } = useUnifiedSearchHook({
    query: debouncedQuery,
    services: SHOP_SERVICES.map((service) => ({
      key: service.key,
      title: service.title,
      description: service.description,
      href: service.href,
    })),
    academyData,
    isLinked,
    perSectionLimit: 8,
  });

  const isDebouncing = query !== debouncedQuery;

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: colors.bg.secondary,
        minHeight: "100vh",
      }}
    >
      <PageLayout maxWidth="2xl">
        <div
          style={{
            display: "grid",
            gap: spacing[8],
            paddingBottom: semanticSpacing.section.lg,
          }}
        >
          <ShopHero />
          <ShopSearchBar
            value={query}
            onChange={setQuery}
            inputRef={inputRef}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={isSearching ? "shop-search" : "shop-sections"}
              {...animations.fadeIn}
            >
              {isSearching ? (
                <ShopSearchResults
                  query={query}
                  result={result}
                  isDebouncing={isDebouncing}
                  services={SHOP_SERVICES}
                />
              ) : (
                <div style={{ display: "grid", gap: spacing[10] }}>
                  <AuthPrompt />

                  <section aria-labelledby="shop-education">
                    <ShopSectionHeading
                      icon={Sparkles}
                      title="التعليم والتطوير"
                      id="shop-education"
                    />
                    <LockedServiceCard isLocked={!isLinked}>
                      <AcademyHeroCard />
                    </LockedServiceCard>
                  </section>

                  <section aria-labelledby="shop-services">
                    <ShopSectionHeading
                      icon={Zap}
                      title="أدوات التداول"
                      id="shop-services"
                    />
                    <ShopServicesGrid services={SHOP_SERVICES} />
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageLayout>
    </div>
  );
}
