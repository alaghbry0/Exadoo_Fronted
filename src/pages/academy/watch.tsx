"use client";
import { componentVariants } from "@/shared/components/ui/variants";
import { colors } from "@/styles/tokens";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useStartWatching, useCourseDetails } from "@/domains/academy/api";
import { useTelegram } from "@/shared/context/TelegramContext";
import {
  ArrowLeft,
  Lock,
  PlayCircle,
  Menu,
  X,
  SkipForward,
} from "lucide-react";
import { cn } from "@/shared/utils";

function toBase64Url(str: string) {
  const b64 =
    typeof window !== "undefined"
      ? btoa(str)
      : Buffer.from(str).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

type Section = {
  id: string;
  title: string;
  lessons: Array<{ id: string; title: string; user_validity?: boolean }>;
};

function CoursePlaylist({
  courseId,
  currentLessonId,
  sections,
}: {
  courseId: string;
  currentLessonId: string;
  sections: Section[];
}) {
  const router = useRouter();
  const handleLessonClick = (lessonId: string) => {
    router.push({ pathname: "/academy/watch", query: { courseId, lessonId } });
  };

  if (!sections?.length) return null;

  return (
    <div className={cn(componentVariants.card.base, "h-full")}>
      <div
        className="p-4 border-b sticky top-0 bg-inherit z-10"
        style={{ borderColor: colors.border.default }}
      >
        <h2 className="font-bold text-lg" style={{ color: colors.text.primary }}>
          محتوى الدورة
        </h2>
      </div>
      <div
        className="divide-y overflow-y-auto h-full pb-20"
        style={{ borderColor: colors.border.default }}
      >
        {sections.map((section) => (
          <div key={section.id} className="animate-fade-in">
            <h3
              className="font-semibold p-4"
              style={{
                backgroundColor: colors.bg.secondary,
                color: colors.text.secondary,
              }}
            >
              {section.title}
            </h3>
            <ul>
              {section.lessons.map((lesson, index) => {
                const isCurrent = lesson.id === currentLessonId;
                const isLocked = lesson.user_validity === false;
                return (
                  <li
                    key={lesson.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => !isLocked && handleLessonClick(lesson.id)}
                      disabled={isLocked}
                      className={cn(
                        "w-full text-right p-4 flex items-center gap-3 transition-all duration-200 group",
                        isCurrent && "border-r-2 border-primary-500",
                        !isLocked && "hover:pr-5",
                        isLocked && "cursor-not-allowed opacity-60",
                      )}
                      style={{
                        backgroundColor: isCurrent
                          ? `${colors.brand.primary}15`
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isLocked && !isCurrent) {
                          e.currentTarget.style.backgroundColor =
                            colors.bg.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLocked && !isCurrent) {
                          e.currentTarget.style.backgroundColor = "";
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110",
                          isCurrent ? "text-primary-500" : "text-neutral-400",
                          isLocked && "text-neutral-500",
                        )}
                      >
                        {isLocked ? (
                          <Lock size={16} />
                        ) : (
                          <PlayCircle size={20} />
                        )}
                      </div>
                      <span
                        className="font-medium text-sm transition-colors"
                        style={{
                          color: isCurrent
                            ? colors.brand.primary
                            : colors.text.secondary,
                        }}
                      >
                        {lesson.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchLessonPage() {
  const router = useRouter();
  const { telegramId } = useTelegram();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  const courseId = (router.query.courseId as string) || "";
  const lessonId = (router.query.lessonId as string) || "";
  const lessonTitleFromQuery = (router.query.lessonTitle as string) || "";

  const {
    mutateAsync,
    isPending,
    isError,
    error,
    data: watchData,
  } = useStartWatching();
  const { data: courseDetails } = useCourseDetails(
    telegramId ?? undefined,
    courseId || undefined,
  );

  useEffect(() => {
    if (telegramId && lessonId) {
      setIsVideoEnded(false);
      mutateAsync({ telegramId, lessonId, playbackType: "inline" }).catch(
        () => {},
      );
    }
  }, [telegramId, lessonId, mutateAsync]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // في الإنتاج: تحقّق من event.origin
      if (event?.data?.action === "videoEnded") setIsVideoEnded(true);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const getInternalEmbed = () => {
    if (!watchData?.m3u8_url) return "";
    const needsHeaders = !!(
      watchData.headers && Object.keys(watchData.headers).length > 0
    );
    const u = encodeURIComponent(toBase64Url(watchData.m3u8_url));
    const h = needsHeaders
      ? `&h=${encodeURIComponent(toBase64Url(JSON.stringify(watchData.headers)))}`
      : "";
    const t = watchData?.thumbnails_vtt_url
      ? `&t=${encodeURIComponent(toBase64Url(String(watchData.thumbnails_vtt_url)))}`
      : "";
    return `/players/hls.html?u=${u}${h}${t}`;
  };

  const findNextLesson = () => {
    if (!courseDetails?.sections?.length) return null;
    const all = (courseDetails.sections as Section[]).flatMap(
      (s) => s.lessons || [],
    );
    const idx = all.findIndex((l) => l.id === lessonId);
    return idx > -1 && idx < all.length - 1 ? all[idx + 1] : null;
  };
  const nextLesson = findNextLesson();

  const handleNextLesson = () => {
    if (nextLesson && nextLesson.user_validity !== false) {
      router.push(
        `/academy/watch?courseId=${courseId}&lessonId=${nextLesson.id}`,
      );
    }
  };

  const renderPlayer = () => {
    if (isPending) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white flex-col gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400">جاري تجهيز المشاهدة…</p>
        </div>
      );
    }
    if (isError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4 text-red-300 flex-col gap-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-center">
            تعذّر بدء المشاهدة: {(error as any)?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    const internal = getInternalEmbed();
    const src = internal || (watchData as any)?.iframe_url;

    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white flex-col gap-3">
          <div className="text-4xl">📺</div>
          <p>لم يتم العثور على الفيديو.</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <iframe
          key={src}
          src={src}
          className="w-full h-full border-0"
          loading="eager"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title="مشغل الفيديو"
        />
        {isVideoEnded && nextLesson && nextLesson.user_validity !== false && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center animate-fade-in z-30">
            <h3 className="text-xl font-bold text-white mb-1">انتهى الدرس</h3>
            <p className="text-neutral-300 mb-4">
              الدرس التالي: {nextLesson.title}
            </p>
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all transform hover:scale-105"
            >
              <SkipForward size={20} />
              <span>الانتقال للدرس التالي</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentLessonTitle =
    lessonTitleFromQuery ||
    (courseDetails?.sections as Section[])
      ?.flatMap((s) => s.lessons)
      .find((l) => l.id === lessonId)?.title ||
    "...";

  return (
    <div
      dir="rtl"
      className="h-screen flex flex-col"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <header
        className={cn(
          componentVariants.card.base,
          "w-full px-4 py-3 flex items-center justify-between flex-shrink-0 z-20",
        )}
      >
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <button
            onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
            }}
            aria-label="فتح/إغلاق قائمة الدروس"
          >
            {isPlaylistOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <Link
              href={`/academy/course/${courseId}`}
              className="text-sm hover:underline hover:text-primary-500 transition-colors block truncate"
              style={{ color: colors.text.tertiary }}
            >
              {courseDetails?.title || "العودة للدورة"}
            </Link>
            <h1 className="font-bold truncate text-sm sm:text-base" style={{ color: colors.text.primary }}>
              {currentLessonTitle}
            </h1>
          </div>
        </div>
        <Link
          href={`/academy/course/${courseId}`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0"
          style={{ backgroundColor: colors.bg.secondary, color: colors.text.primary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.elevated;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.secondary;
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">صفحة الدورة</span>
        </Link>
      </header>
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        <main className="flex-grow w-full lg:w-3/4 bg-black relative">
          <div className="aspect-video w-full h-full">{renderPlayer()}</div>
        </main>

        <aside
          className={cn(
            "w-full lg:w-1/4 h-full overflow-y-auto transition-transform duration-300 absolute lg:relative inset-0 z-10",
            isPlaylistOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0",
          )}
          style={{ backgroundColor: colors.bg.elevated }}
        >
          <CoursePlaylist
            courseId={courseId}
            currentLessonId={lessonId}
            sections={(courseDetails?.sections as Section[]) || []}
          />
        </aside>

        {isPlaylistOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-0"
            onClick={() => setIsPlaylistOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
