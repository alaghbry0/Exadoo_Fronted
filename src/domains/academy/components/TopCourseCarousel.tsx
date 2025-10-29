// src/components/academy/TopCourseCarousel.tsx
import { useState, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartImage from "@/shared/components/common/SmartImage";
import Link from "next/link";
import { fontFamily } from "@/styles/tokens";

interface TopCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
}

interface TopCourseCarouselProps {
  courses: TopCourse[];
  autoScroll?: boolean;
  interval?: number;
}

export const TopCourseCarousel = memo(function TopCourseCarousel({ 
  courses, 
  autoScroll = true,
  interval = 7000 
}: TopCourseCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || courses.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoScroll, courses.length, interval]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - next slide
      setActiveIndex((prev) => (prev + 1) % courses.length);
    } else if (isRightSwipe) {
      // Swipe right - previous slide
      setActiveIndex((prev) => (prev - 1 + courses.length) % courses.length);
    }
  };

  const currentCourse = courses[activeIndex];

  if (!currentCourse) return null;

  return (
    <div>
      {/* Banner with SVG background */}
      <Link href={`/academy/course/${currentCourse.id}`} prefetch>
        <div 
          className="relative w-full touch-pan-y cursor-pointer" 
          style={{ aspectRatio: '440/250' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
        {/* SVG Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <SmartImage
            src="/background_banner.svg"
            alt="Banner Background"
            fill
            blurType="primary"
            className="object-cover"
            priority
            noFade
          />
        </div>
        
        {/* Content overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-6"
          >
            {/* Course Image - Right Side */}
            <div className="flex-shrink-0 order-2">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                <SmartImage
                  src={currentCourse.thumbnail || '/11.png'}
                  alt={currentCourse.title}
                  fill
                  blurType="secondary"
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 96px"
                  priority
                />
              </div>
            </div>
            
            {/* Content - Left Side with Centered Alignment */}
            <div className="flex-1 text-white text-left order-1 min-w-0 flex flex-col justify-center gap-1.5">
              {/* Title - Full Display */}
              <h2
                className="text-lg sm:text-xl font-bold leading-tight"
                style={{ fontFamily: fontFamily.arabic }}
              >
                {currentCourse.title}
              </h2>
              
              {/* Subtitle - Truncated with ... */}
              <p
                className="text-sm sm:text-base font-medium opacity-90 truncate"
                style={{ fontFamily: fontFamily.arabic }}
                title={currentCourse.subtitle}
              >
                {currentCourse.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Carousel Dots - Inside Banner */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2 z-10">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 h-2 bg-white shadow-lg"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      </div>
      </Link>
    </div>
  );
});