// src/lib/search/unified.ts
// فهرس بحث موحّد لخدمات المتجر + محتوى الأكاديمية (كورسات/حزم/تصنيفات)
// من دون أي تبعيات خارجية. سريع وخفيف + يدعم العربية.

export type UnifiedKind = "service" | "course" | "bundle" | "category";

export interface UnifiedDocBase {
  kind: UnifiedKind;
  id: string;
  title: string;
  subtitle?: string; // مثال: الوصف المختصر
  href: string;
  thumbnail?: string;
  // حقل اختياري يمكن استعماله لإظهار شارة "مقفل" على الخدمات
  locked?: boolean;
}

export interface ScoreHit<T extends UnifiedDocBase = UnifiedDocBase> {
  item: T;
  score: number;
}

export interface UnifiedSections {
  services: ScoreHit[];
  courses: ScoreHit[];
  bundles: ScoreHit[];
  categories: ScoreHit[];
}

export interface UnifiedStats {
  total: number;
  tookMs: number;
}

export interface UnifiedResult {
  sections: UnifiedSections;
  flat: ScoreHit[];
  stats: UnifiedStats;
}

// ------ Arabic normalizer ------
export function normalizeArabic(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // إزالة التشكيل
    .replace(/[أإآ]/g, "ا") // توحيد الألف
    .replace(/ى/g, "ي") // توحيد الياء
    .replace(/ة/g, "ه") // توحيد التاء المربوطة
    .replace(/\s+/g, " ")
    .trim();
}

// ------ مُحرّك سكورنغ بسيط ------
// أوزان قابلة للضبط: العنوان أهم من الوصف
const WEIGHTS = { title: 3, subtitle: 1 };

function scoreOne(q: string, doc: UnifiedDocBase): number {
  if (!q) return 0;
  const nq = normalizeArabic(q);
  const nt = normalizeArabic(doc.title);
  const ns = normalizeArabic(doc.subtitle || "");

  let s = 0;
  if (nt.includes(nq)) s += WEIGHTS.title;
  if (ns.includes(nq)) s += WEIGHTS.subtitle;

  // Bonus بسيط: تطابق بادئة الكلمة في العنوان
  if (nt.startsWith(nq)) s += 1.5;

  return s;
}

// ------ مُساعد للتجميع والترتيب ------
function sortDesc<T extends ScoreHit>(arr: T[]): T[] {
  return [...arr].sort((a, b) => b.score - a.score);
}

// ------ البوّابة الرئيسية ------
// services: عناصر المتجر [{ key, title, description, href, ... }]
// academy: { courses, bundles, categories } كما ترجعها useAcademyData
// options.lockResolver: دالة تحدد إن كانت الخدمة مقفلة (مثلاً حسب isLinked)
export function unifiedSearch(
  query: string,
  services: Array<{
    key: string;
    title: string;
    description: string;
    href: string;
  }>,
  academy:
    | {
        courses?: Array<{
          id: string;
          title: string;
          short_description?: string;
          thumbnail?: string;
          price?: string;
          discounted_price?: string;
          level?: string;
        }>;
        bundles?: Array<{
          id: string;
          title: string;
          description?: string;
          image?: string;
          cover_image?: string;
          price?: string;
        }>;
        categories?: Array<{
          id: string;
          name: string;
          thumbnail?: string;
        }>;
      }
    | null
    | undefined,
  options?: {
    lockResolver?: (serviceKey: string) => boolean;
    // حد أقصى لعدد النتائج في كل قسم
    perSectionLimit?: number;
  },
): UnifiedResult {
  const t0 = performance.now();
  const perLimit = options?.perSectionLimit ?? 8;

  // 1) خدمات المتجر -> UnifiedDoc
  const serviceDocs: UnifiedDocBase[] = services.map((s) => ({
    kind: "service",
    id: s.key,
    title: s.title,
    subtitle: s.description,
    href: s.href,
    thumbnail: undefined,
    locked: options?.lockResolver ? options.lockResolver(s.key) : false,
  }));

  // 2) الأكاديمية -> كورسات/حزم/تصنيفات
  const courseDocs: UnifiedDocBase[] = (academy?.courses || []).map((c) => ({
    kind: "course",
    id: c.id,
    title: c.title,
    subtitle: c.short_description || "",
    href: `/academy/course/${c.id}`,
    thumbnail: c.thumbnail,
  }));

  const bundleDocs: UnifiedDocBase[] = (academy?.bundles || []).map((b) => ({
    kind: "bundle",
    id: b.id,
    title: b.title,
    subtitle: (b.description || "").replace(/\\r\\n/g, " "),
    href: `/academy/bundle/${b.id}`,
    thumbnail: b.image || b.cover_image,
  }));

  const categoryDocs: UnifiedDocBase[] = (academy?.categories || []).map(
    (cat) => ({
      kind: "category",
      id: cat.id,
      title: cat.name,
      subtitle: "تصنيف",
      href: `/academy/category/${cat.id}`,
      thumbnail: cat.thumbnail,
    }),
  );

  const allDocs = [
    ...serviceDocs,
    ...courseDocs,
    ...bundleDocs,
    ...categoryDocs,
  ];

  if (!query.trim()) {
    return {
      sections: {
        services: [],
        courses: [],
        bundles: [],
        categories: [],
      },
      flat: [],
      stats: { total: 0, tookMs: 0 },
    };
  }

  // 3) حساب السكور لكل مستند
  const hits: ScoreHit[] = [];
  for (const doc of allDocs) {
    const sc = scoreOne(query, doc);
    if (sc > 0) hits.push({ item: doc, score: sc });
  }

  // 4) تقسيم حسب النوع + تحديد الحد
  const byKind = {
    services: sortDesc(hits.filter((h) => h.item.kind === "service")).slice(
      0,
      perLimit,
    ),
    courses: sortDesc(hits.filter((h) => h.item.kind === "course")).slice(
      0,
      perLimit,
    ),
    bundles: sortDesc(hits.filter((h) => h.item.kind === "bundle")).slice(
      0,
      perLimit,
    ),
    categories: sortDesc(hits.filter((h) => h.item.kind === "category")).slice(
      0,
      perLimit,
    ),
  };

  const t1 = performance.now();
  const flat = sortDesc(hits);

  return {
    sections: byKind,
    flat,
    stats: { total: hits.length, tookMs: Math.max(0, t1 - t0) },
  };
}
