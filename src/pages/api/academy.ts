// pages/api/academy.ts
import type { NextApiRequest, NextApiResponse } from "next";

// ===== Types: كما حددتها أنت =====
type Level = "beginner" | "intermediate" | "advanced" | string;
type Status = "active" | "coming_soon" | string;

export interface Course {
  id: string;
  title: string;
  short_description: string;
  description: string;
  outcomes: string[];
  language: string;
  category_id: string;
  sub_category_id: string;
  section: string;
  requirements: string[];
  price: string;
  discount_flag: string | null;
  discounted_price: string;
  level: Level;
  user_id: string;
  thumbnail: string;
  video_url: string;
  expiry_days: string;
  date_added: string;
  last_modified: string;
  course_type: string;
  is_top_course: string;
  is_highlight_course: string;
  is_admin: string;
  is_disabled: string;
  status: Status;
  course_overview_provider: string;
  meta_keywords: string;
  meta_description: string;
  is_free_course: string | null;
  is_limit_working: string;
  multi_instructor: string;
  creator: string;
  cover_image: string;
  rating: number;
  number_of_ratings: number;
  instructor_name: string;
  total_enrollment: number;
  total_number_of_lessons: number;
  completion?: number;
  total_number_of_completed_lessons?: number;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  requirements: string[];
  outcomes: string[];
  course_ids: string;
  free_sessions_count: string;
  discounted_price: string;
  cover_image: string;
  telegram_url: string;
  status: string;
  sub_category_id: string;
  is_top: string;
  is_highlight: string;
  is_disabled: string;
  date_added: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  parent: string;
  type: string | null;
  slug: string;
  date_added: string;
  last_modified: string;
  font_awesome_class: string;
  thumbnail: string;
  number_of_courses: number;
}

export interface AcademyData {
  courses: Course[];
  bundles: Bundle[];
  my_enrollments: { course_ids: string[]; bundle_ids: string[] };
  top_course_ids: string[];
  highlight_course_ids: string[];
  top_bundle_ids: string[];
  highlight_bundle_ids: string[];
  categories: Category[];
}

// ===== utils صغيرة =====
const S = (v: any, fb = "") => (v ?? fb).toString();
const N = (v: any, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const A = (v: any): string[] => (Array.isArray(v) ? v.map((x) => S(x)) : []);
const arrToJSONString = (v: any): string => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return JSON.stringify(v.map((x) => S(x)));
  return "[]";
};
const idsFromMixed = (arr: any[]): string[] => {
  // يدعم ["1","2"] أو [{id:"1"}, {id:"2"}]
  return (arr || [])
    .map((x) =>
      typeof x === "object" && x && "id" in x ? S((x as any).id) : S(x),
    )
    .filter(Boolean);
};

// ===== محوّلات =====
function normalizeCourse(raw: any): Course {
  return {
    id: S(raw.id),
    title: S(raw.title),
    short_description: S(raw.short_description),
    description: S(raw.description),
    outcomes: A(raw.outcomes),
    language: S(raw.language),
    category_id: S(raw.category_id),
    sub_category_id: S(raw.sub_category_id),
    section: arrToJSONString(raw.section), // تبقى String JSON كما طلبت
    requirements: A(raw.requirements),
    price: S(raw.price, "0"),
    discount_flag: raw.discount_flag == null ? null : S(raw.discount_flag),
    discounted_price: S(raw.discounted_price, "0"),
    level: S(raw.level),
    user_id: S(raw.user_id),
    thumbnail: S(raw.thumbnail),
    video_url: S(raw.video_url || ""),
    expiry_days: S(raw.expiry_days || ""),
    date_added: S(raw.date_added || ""),
    last_modified: S(raw.last_modified || ""),
    course_type: S(raw.course_type || ""),
    is_top_course: S(raw.is_top_course || "0"),
    is_highlight_course: S(raw.is_highlight_course || "0"),
    is_admin: S(raw.is_admin || "0"),
    is_disabled: S(raw.is_disabled || "0"),
    status: S(raw.status || "active"),
    course_overview_provider: S(raw.course_overview_provider || ""),
    meta_keywords: S(raw.meta_keywords || ""),
    meta_description: S(raw.meta_description || ""),
    is_free_course: raw.is_free_course == null ? null : S(raw.is_free_course),
    is_limit_working: S(raw.is_limit_working || "0"),
    multi_instructor: S(raw.multi_instructor || "0"),
    creator: S(raw.creator || ""),
    cover_image: S(raw.cover_image || ""),
    rating: N(raw.rating, 0),
    number_of_ratings: N(raw.number_of_ratings, 0),
    instructor_name: S(raw.instructor_name || ""),
    total_enrollment: N(raw.total_enrollment, 0),
    total_number_of_lessons: N(raw.total_number_of_lessons, 0),
    completion: raw.completion != null ? N(raw.completion, 0) : undefined,
    total_number_of_completed_lessons:
      raw.total_number_of_completed_lessons != null
        ? N(raw.total_number_of_completed_lessons, 0)
        : undefined,
  };
}

function normalizeBundle(raw: any): Bundle {
  return {
    id: S(raw.id),
    title: S(raw.title),
    description: S(raw.description),
    price: S(raw.price, "0"),
    image: S(raw.image || ""),
    requirements: A(raw.requirements),
    outcomes: A(raw.outcomes),
    course_ids: arrToJSONString(raw.course_ids), // String JSON
    free_sessions_count: S(raw.free_sessions_count || "0"),
    discounted_price: S(raw.discounted_price || "0"),
    cover_image: S(raw.cover_image || ""),
    telegram_url: S(raw.telegram_url || ""),
    status: S(raw.status || "active"),
    sub_category_id: S(raw.sub_category_id || ""),
    is_top: S(raw.is_top || "0"),
    is_highlight: S(raw.is_highlight || "0"),
    is_disabled: S(raw.is_disabled || "0"),
    date_added: S(raw.date_added || ""),
  };
}

function normalizeCategory(raw: any): Category {
  return {
    id: S(raw.id),
    code: S(raw.code || ""),
    name: S(raw.name || ""),
    parent: S(raw.parent || "0"),
    type: raw.type == null ? null : S(raw.type),
    slug: S(raw.slug || ""),
    date_added: S(raw.date_added || ""),
    last_modified: S(raw.last_modified || ""),
    font_awesome_class: S(raw.font_awesome_class || ""),
    thumbnail: S(raw.thumbnail || ""),
    number_of_courses: N(raw.number_of_courses, 0),
  };
}

// ===== النسخة المرنة لمحلّل الأكاديمية =====
function normalizeAcademyPayload(payload: any): AcademyData {
  // 1) التقط الـ academy لو موجود، وإلا خذ الجذر نفسه
  const root = payload && typeof payload === "object" ? payload : {};
  const ac =
    root.academy && typeof root.academy === "object" ? root.academy : root;

  // 2) ادعم الحقلين: all_* أو * بدون all_
  const rawCourses = Array.isArray(ac.all_courses)
    ? ac.all_courses
    : Array.isArray(ac.courses)
      ? ac.courses
      : [];
  const rawBundles = Array.isArray(ac.all_bundles)
    ? ac.all_bundles
    : Array.isArray(ac.bundles)
      ? ac.bundles
      : [];
  const rawCategories = Array.isArray(ac.categories) ? ac.categories : [];

  const courses: Course[] = rawCourses.map(normalizeCourse);
  const bundles: Bundle[] = rawBundles.map(normalizeBundle);
  const categories: Category[] = rawCategories.map(normalizeCategory);

  // 3) ادعم كون الـ Top/Highlight قد يكون IDs أو كائنات + أسماء بديلة *_ids
  const top_course_ids = idsFromMixed(
    ac.top_courses ?? ac.top_course_ids ?? [],
  );
  const highlight_course_ids = idsFromMixed(
    ac.highlight_courses ?? ac.highlight_course_ids ?? [],
  );
  const top_bundle_ids = idsFromMixed(
    ac.top_bundles ?? ac.top_bundle_ids ?? [],
  );
  const highlight_bundle_ids = idsFromMixed(
    ac.highlight_bundles ?? ac.highlight_bundle_ids ?? [],
  );

  // 4) الاشتراكات: يدعم الشكلين
  const me = ac.my_enrollments ?? {};
  let course_ids: string[] = Array.isArray(me.course_ids)
    ? me.course_ids.map(String)
    : [];
  let bundle_ids: string[] = Array.isArray(me.bundle_ids)
    ? me.bundle_ids.map(String)
    : [];
  if (Array.isArray(me.courses) && !course_ids.length)
    course_ids = idsFromMixed(me.courses);
  if (Array.isArray(me.bundles) && !bundle_ids.length)
    bundle_ids = idsFromMixed(me.bundles);

  return {
    courses,
    bundles,
    categories,
    my_enrollments: { course_ids, bundle_ids },
    top_course_ids,
    highlight_course_ids,
    top_bundle_ids,
    highlight_bundle_ids,
  };
}

// ===== API Handler =====
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const telegramId = (req.query.telegramId ?? "").toString().trim();
    if (!telegramId)
      return res.status(400).json({ error: "Missing telegramId" });

    const BASE = process.env.NEXT_PUBLIC_APPLICATION_URL;
    const SECRET = process.env.NEXT_PUBLIC_APPLICATION_SECRET; // ← مهم: سرّ خادمي فقط
    if (!BASE || !SECRET) {
      return res.status(500).json({
        error: "Server misconfigured",
        has_BASE: Boolean(BASE),
        has_SECRET: Boolean(SECRET),
      });
    }

    const url = `${BASE}/api/getAllServicesForMiniApp/${encodeURIComponent(telegramId)}/academy`;

    const upstream = await fetch(url, {
      headers: {
        Accept: "application/json",
        // <-- حسب ما ذكرت: اسم الهيدر "secret" + صيغة Bearer
        secret: `Bearer ${SECRET}`,
      },
    });

    const text = await upstream.text();
    let raw: any = null;
    try {
      raw = JSON.parse(text);
    } catch {}

    if (req.query.raw === "1") {
      return res.status(upstream.status).json({
        upstream_url: url,
        upstream_status: upstream.status,
        upstream_ok: upstream.ok,
        content_type: upstream.headers.get("content-type"),
        raw_text_snippet: text.slice(0, 1200),
      });
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "Upstream failed",
        upstream_status: upstream.status,
        details_snippet: text.slice(0, 500),
      });
    }

    const academy = normalizeAcademyPayload(raw);

    if (req.query.debug === "1") {
      return res.status(200).json({
        upstream_url: url,
        upstream_ok: upstream.ok,
        upstream_status: upstream.status,
        academy_counts: {
          courses: academy.courses.length,
          bundles: academy.bundles.length,
          categories: academy.categories.length,
        },
        sample_course: academy.courses[0] ?? null,
        sample_bundle: academy.bundles[0] ?? null,
      });
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=600",
    );
    return res.status(200).json({ academy });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "Internal error", message: e?.message });
  }
}
