import type { ReactNode } from "react";
import Link from "next/link";
import type { UnifiedResult } from "@/lib/search/unified";
import { HalfCardSkeleton, WideCardSkeleton } from "@/shared/components/common/SkeletonLoaders";
import { colors, radius, spacing, typography } from "@/styles/tokens";

import type { ShopServiceMeta } from "../data/services";
import { ShopServicesGrid } from "./ShopServicesGrid";

interface ShopSearchResultsProps {
  query: string;
  result: UnifiedResult;
  isDebouncing: boolean;
  services: ShopServiceMeta[];
}

export function ShopSearchResults({
  query,
  result,
  isDebouncing,
  services,
}: ShopSearchResultsProps) {
  if (isDebouncing) {
    return (
      <div
        style={{
          display: "grid",
          gap: spacing[4],
        }}
      >
        <WideCardSkeleton />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
            gap: spacing[4],
          }}
        >
          <HalfCardSkeleton />
          <HalfCardSkeleton />
        </div>
      </div>
    );
  }

  const matchedServices = result.sections.services
    .map((hit) => services.find((service) => service.key === hit.item.id))
    .filter(Boolean) as ShopServiceMeta[];

  const hasResults =
    matchedServices.length > 0 ||
    result.sections.courses.length > 0 ||
    result.sections.bundles.length > 0 ||
    result.sections.categories.length > 0;

  if (!hasResults) {
    return (
      <div
        style={{
          textAlign: "center",
          paddingBlock: spacing[12],
          color: colors.text.secondary,
        }}
      >
        <p>
          لا توجد نتائج مطابقة لكلمة البحث «{query}» حالياً. جرّب كلمات مفتاحية
          مختلفة.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: spacing[8] }}>
      {matchedServices.length > 0 ? (
        <SearchSection title="الخدمات">
          <ShopServicesGrid services={matchedServices} />
        </SearchSection>
      ) : null}

      {result.sections.courses.length > 0 ? (
        <SearchSection title="الكورسات">
          <div style={gridStyle}>
            {result.sections.courses.map((hit) => (
              <AcademyHitCard
                key={`course-${hit.item.id}`}
                doc={hit.item}
                label="دورة"
              />
            ))}
          </div>
        </SearchSection>
      ) : null}

      {result.sections.bundles.length > 0 ? (
        <SearchSection title="الحزم">
          <div style={gridStyle}>
            {result.sections.bundles.map((hit) => (
              <AcademyHitCard
                key={`bundle-${hit.item.id}`}
                doc={hit.item}
                label="حزمة"
              />
            ))}
          </div>
        </SearchSection>
      ) : null}

      {result.sections.categories.length > 0 ? (
        <SearchSection title="التصنيفات">
          <div style={gridStyle}>
            {result.sections.categories.map((hit) => (
              <AcademyHitCard
                key={`category-${hit.item.id}`}
                doc={hit.item}
                label="تصنيف"
              />
            ))}
          </div>
        </SearchSection>
      ) : null}
    </div>
  );
}

interface SearchSectionProps {
  title: string;
  children: ReactNode;
}

function SearchSection({ title, children }: SearchSectionProps) {
  return (
    <section style={{ display: "grid", gap: spacing[4] }}>
      <h3 className={typography.heading.md} style={{ color: colors.text.primary }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

const gridStyle = {
  display: "grid",
  gap: spacing[4],
  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
} as const;

interface AcademyHitCardProps {
  doc: {
    href: string;
    title: string;
    subtitle?: string;
  };
  label: string;
}

function AcademyHitCard({ doc, label }: AcademyHitCardProps) {
  return (
    <Link
      href={doc.href}
      prefetch={false}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
      aria-label={`${label} ${doc.title}`}
    >
      <article
        style={{
          borderRadius: radius["3xl"],
          border: `1px solid ${colors.border.default}`,
          padding: spacing[5],
          backgroundColor: colors.bg.elevated,
          boxShadow: "none",
          display: "grid",
          gap: spacing[3],
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: colors.text.tertiary,
          }}
        >
          {label}
        </span>
        <h4
          className={typography.heading.md}
          style={{
            color: colors.text.primary,
            lineHeight: 1.4,
          }}
        >
          {doc.title}
        </h4>
        {doc.subtitle ? (
          <p
            className={typography.body.sm}
            style={{ color: colors.text.secondary }}
          >
            {doc.subtitle}
          </p>
        ) : null}
      </article>
    </Link>
  );
}
