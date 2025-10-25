/**
 * 🖼️ أمثلة عملية لتحميل الصور
 * 
 * هذا الملف يحتوي على أمثلة جاهزة يمكن نسخها واستخدامها مباشرة
 * في المشروع لتحسين تحميل وعرض الصور.
 * 
 * آخر تحديث: 25 أكتوبر 2025
 */

import SmartImage from '@/shared/components/common/SmartImage';
import { LazyLoad } from '@/components/common/LazyLoad';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// مثال 1: Product Card مع صورة lazy loading
// ==========================================

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* صورة المنتج */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-neutral-800">
        <SmartImage
          src={product.image}
          alt={product.name}
          lazy={true}
          loaderType="skeleton"
          blurType="neutral"
          fallbackSrc="/product-placeholder.jpg"
          fill
          className="object-cover"
        />
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-500">
            ${product.price}
          </span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            أضف للسلة
          </button>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// مثال 2: Course Card (مثل Academy)
// ==========================================

interface Course {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  price: string;
  instructor: string;
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden">
      {/* صورة الكورس */}
      <div className="relative h-40 w-full">
        <SmartImage
          src={course.thumbnail}
          alt={course.title}
          lazy={true}
          loaderType="pulse"
          blurType="primary"
          autoQuality={true}
          fallbackSrc="/11.png"
          fill
          className="object-cover"
        />
        
        {/* Badge على الصورة */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          جديد
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-4 space-y-3" dir="rtl">
        <div>
          <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
            {course.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-500">{course.instructor}</span>
          <span className="text-lg font-bold text-blue-500">${course.price}</span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// مثال 3: User Avatar مع fallback
// ==========================================

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

export function UserAvatar({ 
  src, 
  name, 
  size = 'md',
  online = false 
}: UserAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full overflow-hidden ring-2 ring-white dark:ring-neutral-800 shadow-md`}>
        <SmartImage
          src={src || '/default-avatar.png'}
          alt={name}
          lazy={true}
          loaderType="spinner"
          fallbackSrc="/default-avatar.png"
          fill
          className="object-cover"
        />
      </div>

      {/* Online Indicator */}
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-neutral-800" />
      )}
    </div>
  );
}

// ==========================================
// مثال 4: Image Gallery مع Grid
// ==========================================

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
}

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div 
          key={image.id}
          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        >
          <SmartImage
            src={image.thumbnail || image.src}
            alt={image.alt}
            lazy={index > 3} // أول 4 صور بدون lazy
            loaderType="pulse"
            blurType="neutral"
            autoQuality={true}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// مثال 5: Hero Section بدون lazy loading
// ==========================================

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  onCtaClick: () => void;
}

export function HeroSection({ 
  title, 
  subtitle, 
  backgroundImage,
  ctaText,
  onCtaClick 
}: HeroProps) {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {/* صورة الخلفية */}
      <SmartImage
        src={backgroundImage}
        alt="Hero Background"
        eager={true}              // تحميل فوري
        noFade={true}             // بدون fade
        disableSkeleton={true}    // بدون skeleton
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* المحتوى */}
      <div className="relative z-10 text-center text-white space-y-6 px-4">
        <h1 className="text-5xl md:text-6xl font-bold">
          {title}
        </h1>
        <p className="text-xl md:text-2xl opacity-90">
          {subtitle}
        </p>
        <button
          onClick={onCtaClick}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-lg font-bold shadow-xl transition-colors"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// مثال 6: Blog Post Card
// ==========================================

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all">
      {/* صورة الغلاف */}
      <div className="relative h-56 w-full">
        <SmartImage
          src={post.coverImage}
          alt={post.title}
          lazy={true}
          loaderType="skeleton"
          blurType="neutral"
          fill
          className="object-cover"
        />
      </div>

      {/* المحتوى */}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold line-clamp-2 hover:text-blue-500 transition-colors">
          {post.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
          {post.excerpt}
        </p>

        {/* المؤلف والتاريخ */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <UserAvatar 
              src={post.author.avatar} 
              name={post.author.name}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.publishedAt}</p>
            </div>
          </div>
          
          <span className="text-sm text-gray-500">{post.readTime}</span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// مثال 7: Profile Header
// ==========================================

interface ProfileHeaderProps {
  coverImage: string;
  avatar: string;
  name: string;
  bio: string;
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
}

export function ProfileHeader({ 
  coverImage, 
  avatar, 
  name, 
  bio,
  stats 
}: ProfileHeaderProps) {
  return (
    <div className="w-full">
      {/* صورة الغلاف */}
      <div className="relative h-64 w-full">
        <SmartImage
          src={coverImage}
          alt="Cover"
          eager={true}
          loaderType="skeleton"
          blurType="primary"
          fill
          className="object-cover"
        />
      </div>

      {/* صورة البروفايل */}
      <div className="relative px-6 -mt-16">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-xl">
          <SmartImage
            src={avatar}
            alt={name}
            eager={true}
            loaderType="spinner"
            fallbackSrc="/default-avatar.png"
            fill
            className="object-cover"
          />
        </div>

        {/* المعلومات */}
        <div className="mt-4 space-y-2">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{bio}</p>

          {/* الإحصائيات */}
          <div className="flex gap-6 pt-4">
            <div>
              <span className="font-bold text-lg">{stats.posts}</span>
              <span className="text-gray-500 ml-2">منشور</span>
            </div>
            <div>
              <span className="font-bold text-lg">{stats.followers}</span>
              <span className="text-gray-500 ml-2">متابع</span>
            </div>
            <div>
              <span className="font-bold text-lg">{stats.following}</span>
              <span className="text-gray-500 ml-2">متابَع</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// مثال 8: Infinite Scroll List
// ==========================================

interface ListItem {
  id: string;
  title: string;
  image: string;
  description: string;
}

export function InfiniteScrollList({ items }: { items: ListItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="flex gap-4 p-4 hover:shadow-lg transition-shadow">
          {/* صورة صغيرة */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <SmartImage
              src={item.image}
              alt={item.title}
              lazy={index > 2}       // أول 3 عناصر بدون lazy
              loaderType="pulse"
              blurType="neutral"
              fill
              className="object-cover"
            />
          </div>

          {/* المحتوى */}
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {item.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ==========================================
// مثال 9: LazyLoad للمحتوى الثقيل
// ==========================================

function ExpensiveChart() {
  // مكون ثقيل يحتاج وقت للتحميل
  return <div>Chart Component</div>;
}

export function DashboardSection() {
  return (
    <div className="space-y-6">
      {/* محتوى عادي */}
      <div>
        <h2 className="text-2xl font-bold mb-4">لوحة التحكم</h2>
      </div>

      {/* محتوى ثقيل مع lazy load */}
      <LazyLoad 
        fallback={
          <div className="h-64 bg-gray-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
        }
        threshold={0.1}
        rootMargin="100px"
      >
        <ExpensiveChart />
      </LazyLoad>
    </div>
  );
}

// ==========================================
// مثال 10: Comparison Component
// ==========================================

interface ComparisonProps {
  beforeImage: string;
  afterImage: string;
  title: string;
}

export function BeforeAfterComparison({ 
  beforeImage, 
  afterImage, 
  title 
}: ComparisonProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center">{title}</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <p className="text-center font-semibold text-gray-600">قبل</p>
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <SmartImage
              src={beforeImage}
              alt="Before"
              lazy={true}
              loaderType="skeleton"
              blurType="neutral"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <p className="text-center font-semibold text-gray-600">بعد</p>
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <SmartImage
              src={afterImage}
              alt="After"
              lazy={true}
              loaderType="skeleton"
              blurType="primary"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Export All Examples
// ==========================================

export const ImageLoadingExamples = {
  ProductCard,
  CourseCard,
  UserAvatar,
  ImageGallery,
  HeroSection,
  BlogPostCard,
  ProfileHeader,
  InfiniteScrollList,
  DashboardSection,
  BeforeAfterComparison,
};

/**
 * استخدام الأمثلة:
 * 
 * import { ProductCard } from '@/docs/examples/IMAGE_LOADING_EXAMPLES';
 * 
 * <ProductCard product={myProduct} />
 */
