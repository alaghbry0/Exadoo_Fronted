import Head from "next/head";

import ThemeToggle from "@/shared/components/common/ThemeToggle";
import PageLayout from "@/shared/components/layout/PageLayout";
import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  semanticSpacing,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

export default function CustomizationPage() {
  return (
    <>
      <Head>
        <title>إعدادات التخصيص</title>
        <meta
          name="description"
          content="اختر الوضع الفاتح أو الداكن أو مطابق للنظام للحصول على تجربة تناسب تفضيلاتك."
        />
      </Head>

      <PageLayout 
        maxWidth="2xl"
        showFooter={false}>
        <div
          dir="rtl"
          className="flex flex-col"
          
          style={{
            color: colors.text.primary,
            gap: semanticSpacing.section.sm,
            paddingTop: semanticSpacing.section.sm,
            paddingBottom: semanticSpacing.section.sm,
          }}
        >
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
              إعدادات التخصيص
            </h1>
            <p className="text-base" style={{ color: colors.text.secondary }}>
              تحكّم في شكل التطبيق بما يناسب راحتك. يمكنك التبديل بين الوضع الفاتح والداكن، أو
              اختيار مطابقة إعدادات جهازك تلقائياً.
            </p>
          </header>

          <section
            className={cn(
              "flex flex-col",
              componentRadius.card,
              shadowClasses.card,
            )}
            style={{
              backgroundColor: withAlpha(colors.bg.secondary, 0.85),
              border: `1px solid ${withAlpha(colors.border.default, 0.55)}`,
              gap: semanticSpacing.component.lg,
              padding: semanticSpacing.layout.md,
            }}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                اختيار الثيم
              </h2>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                يتم حفظ اختيارك تلقائياً على هذا الجهاز باستخدام التخزين المحلي، ويمكنك تغييره في أي
                وقت من خلال شريط التنقل.
              </p>
            </div>

            <ThemeToggle showLabels />
          </section>

          <section
            className={cn("grid gap-4 md:grid-cols-2")}
            aria-label="نصائح للاستفادة من الثيم"
          >
            {["راحة العينين في الإضاءة المنخفضة", "وضوح أعلى في الإضاءة العالية"].map((item, index) => (
              <article
                key={item}
                className={cn(
                  "flex flex-col gap-2 border p-4",
                  componentRadius.card,
                  shadowClasses.card,
                )}
                style={{
                  backgroundColor: withAlpha(colors.bg.primary, 0.98),
                  borderColor: withAlpha(colors.border.default, 0.5),
                }}
              >
                <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  {item}
                </h3>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {index === 0
                    ? "الوضع الداكن يقلل من إجهاد العين أثناء الاستخدام الليلي أو في البيئات قليلة الإضاءة."
                    : "الوضع الفاتح يمنحك أقصى درجات التباين أثناء النهار أو الأماكن المضاءة جيداً."}
                </p>
              </article>
            ))}
          </section>
        </div>
      </PageLayout>
    </>
  );
}
