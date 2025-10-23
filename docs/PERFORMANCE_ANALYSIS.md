# 📊 تحليل الأداء والتحسينات

> **تاريخ المراجعة:** 23 أكتوبر 2025  
> **الحالة:** تحليل شامل للأداء والتحسينات المقترحة

---

## 🎯 ملخص تنفيذي

المشروع يستخدم **Next.js 15** مع **React 19** وهو مبني بشكل احترافي. تم رصد عدة نقاط قوة وفرص للتحسين في الأداء.

### النتيجة الإجمالية: **8.2/10** ⭐

---

## ✅ نقاط القوة الحالية

### 1. **البنية التقنية المتقدمة**
- ✅ استخدام Next.js 15 مع React 19 (أحدث الإصدارات)
- ✅ TypeScript للـ Type Safety
- ✅ TanStack Query (React Query) لإدارة البيانات
- ✅ Zustand لإدارة الحالة العامة
- ✅ Framer Motion للحركات السلسة

### 2. **التحسينات المطبقة**

#### أ) تحسينات الصور
```typescript
// next.config.ts
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 يوم
}
```

#### ب) استراتيجية التخزين المؤقت
```typescript
// Headers configuration
{
  source: "/_next/static/:path*",
  headers: [{ 
    key: "Cache-Control", 
    value: "public, max-age=31536000, immutable" 
  }],
}
```

#### ج) React Query Configuration
```typescript
const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 دقائق
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000         // 10 دقائق
    }
  }
})
```

### 3. **تحسينات الأداء المطبقة**
- ✅ Code Splitting تلقائي عبر Next.js
- ✅ Lazy Loading للمكونات
- ✅ Prefetching للصفحات الرئيسية
- ✅ Bundle Analyzer متاح (`npm run analyze`)
- ✅ Compression مفعّل في next.config

---

## ⚠️ فرص التحسين

### 1. **تحسين استراتيجية التحميل**

#### المشكلة
```typescript
// src/pages/_app.tsx - السطر 166-177
useEffect(() => {
  const prefetchPages = async () => {
    try {
      const pagesToPrefetch = ['/', '/shop', '/plans', '/profile', '/notifications'];
      await Promise.all(pagesToPrefetch.map(page => router.prefetch(page)));
    } catch (error) {
      logger.warn('Prefetch error', error);
    }
  };
  prefetchPages();
}, [router]);
```

**المشكلة:** Prefetch لجميع الصفحات مرة واحدة يزيد من الحمل الأولي.

#### الحل المقترح
```typescript
// استخدام Intersection Observer للـ Prefetch عند الحاجة
useEffect(() => {
  const prefetchOnIdle = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        router.prefetch('/shop');
        router.prefetch('/profile');
      });
    } else {
      setTimeout(() => {
        router.prefetch('/shop');
        router.prefetch('/profile');
      }, 1000);
    }
  };
  
  prefetchOnIdle();
}, [router]);
```

**التأثير المتوقع:** تقليل وقت التحميل الأولي بنسبة 15-20%

---

### 2. **تحسين إدارة الحالة والاشتراكات**

#### المشكلة
```typescript
// src/pages/_app.tsx - السطر 145-164
useEffect(() => {
  const fetchSubscriptions = async () => {
    if (!telegramId) return;
    try {
      const cached = localStorage.getItem(`subscriptions_${telegramId}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setSubscriptions(data);
          return;
        }
      }
    } catch (error) {
      logger.error(`Failed to load subscriptions`, error);
    }
  };
  fetchSubscriptions();
  const interval = setInterval(fetchSubscriptions, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [telegramId, setSubscriptions]);
```

**المشكلات:**
1. استخدام `localStorage` مباشرة بدلاً من React Query
2. Polling كل 5 دقائق حتى لو المستخدم غير نشط
3. عدم استخدام SSE أو WebSocket للتحديثات الفورية

#### الحل المقترح
```typescript
// استخدام React Query مع SSE
const { data: subscriptions } = useQuery({
  queryKey: ['subscriptions', telegramId],
  queryFn: () => fetchSubscriptions(telegramId),
  staleTime: 5 * 60 * 1000,
  enabled: !!telegramId,
  // استخدام SSE للتحديثات الفورية
  refetchInterval: false, // إيقاف الـ polling
});

// في hook منفصل
useSubscriptionSSE(telegramId, {
  onUpdate: (data) => {
    queryClient.setQueryData(['subscriptions', telegramId], data);
  }
});
```

**التأثير المتوقع:** 
- تقليل استهلاك البيانات بنسبة 60%
- تحديثات فورية بدلاً من الانتظار 5 دقائق

---

### 3. **تحسين Bundle Size**

#### التحليل الحالي
```json
// package.json - المكتبات الكبيرة
{
  "@radix-ui/*": "~40 مكتبة",           // ~150KB
  "framer-motion": "^12.4.10",          // ~80KB
  "@tanstack/react-query": "^5.71.10",  // ~40KB
  "axios": "^1.8.4"                     // ~30KB
}
```

#### التحسينات المقترحة

**أ) Tree Shaking للـ Radix UI**
```typescript
// ❌ سيء - يستورد كل شيء
import * as Dialog from '@radix-ui/react-dialog';

// ✅ جيد - يستورد فقط ما تحتاجه
import { Root, Trigger, Content } from '@radix-ui/react-dialog';
```

**ب) Dynamic Imports للمكونات الثقيلة**
```typescript
// src/components/AcademyPurchaseModal.tsx
import dynamic from 'next/dynamic';

const AcademyPurchaseModal = dynamic(
  () => import('@/features/academy/components/AcademyPurchaseModal'),
  { 
    loading: () => <ModalSkeleton />,
    ssr: false 
  }
);
```

**ج) استبدال axios بـ fetch**
```typescript
// بدلاً من axios (30KB)
// استخدم fetch المدمج مع wrapper خفيف
export const apiClient = {
  get: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },
  // ... بقية الـ methods
};
```

**التأثير المتوقع:** تقليل Bundle Size بنسبة 25-30% (~100KB)

---

### 4. **تحسين الحركات والـ Animations**

#### المشكلة
```typescript
// استخدام framer-motion في كل مكان
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
```

**المشاكل:**
1. Framer Motion ثقيل (80KB)
2. استخدامه في مكونات بسيطة غير ضروري
3. يؤثر على First Paint

#### الحل المقترح
```typescript
// للحركات البسيطة: استخدم CSS فقط
// globals.css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

// للحركات المعقدة فقط: استخدم framer-motion
const ComplexAnimation = dynamic(
  () => import('./ComplexAnimation'),
  { ssr: false }
);
```

**التأثير المتوقع:** 
- تحسين First Paint بنسبة 20%
- تقليل JavaScript execution time

---

### 5. **تحسين الخطوط (Fonts)**

#### الوضع الحالي
```css
/* globals.css */
@font-face { 
  font-family: 'Almarai'; 
  font-weight: 300; 
  src: url('/fonts/Almarai-Light.ttf') format('truetype'); 
  font-display: swap; 
}
/* ... 7 خطوط أخرى */
```

**المشاكل:**
1. تحميل 8 ملفات خطوط منفصلة
2. استخدام TTF بدلاً من WOFF2
3. عدم استخدام font subsetting

#### الحل المقترح
```typescript
// next.config.ts
import { NextFontWithVariable } from 'next/font/google';

const almarai = NextFontWithVariable({
  src: [
    { path: './fonts/Almarai-Light.woff2', weight: '300' },
    { path: './fonts/Almarai-Regular.woff2', weight: '400' },
    { path: './fonts/Almarai-Bold.woff2', weight: '700' },
  ],
  variable: '--font-almarai',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});
```

**الخطوات:**
1. تحويل TTF إلى WOFF2 (تقليل الحجم 70%)
2. استخدام font subsetting للأحرف العربية فقط
3. استخدام next/font للتحسين التلقائي

**التأثير المتوقع:** 
- تقليل حجم الخطوط من ~800KB إلى ~200KB
- تحسين LCP بنسبة 30%

---

### 6. **تحسين الصور والميديا**

#### المشكلة
```typescript
// استخدام SmartImage لكن بدون optimization كامل
<SmartImage
  src={course.image}
  alt={course.title}
  className="w-full h-48 object-cover"
/>
```

#### الحل المقترح
```typescript
// إضافة placeholder blur
import Image from 'next/image';

<Image
  src={course.image}
  alt={course.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// إنشاء blur placeholder تلقائياً
export async function getBase64ImageUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const { base64 } = await getPlaiceholder(Buffer.from(buffer));
  return base64;
}
```

**التأثير المتوقع:** تحسين CLS وتجربة المستخدم

---

## 📈 خطة التنفيذ المقترحة

### المرحلة 1: تحسينات سريعة (أسبوع واحد)
- [ ] تحويل الخطوط إلى WOFF2
- [ ] إضافة Dynamic Imports للمكونات الثقيلة
- [ ] تحسين استراتيجية Prefetch
- [ ] إضافة Image Placeholders

**التأثير المتوقع:** تحسين 25% في الأداء

### المرحلة 2: تحسينات متوسطة (أسبوعان)
- [ ] استبدال axios بـ fetch wrapper
- [ ] تحسين Tree Shaking
- [ ] تحسين CSS (إزالة الغير مستخدم)
- [ ] إضافة Service Worker للـ caching

**التأثير المتوقع:** تحسين 35% في الأداء

### المرحلة 3: تحسينات متقدمة (شهر)
- [ ] تطبيق SSE بدلاً من polling
- [ ] إضافة PWA capabilities
- [ ] تحسين Critical CSS
- [ ] إضافة Resource Hints

**التأثير المتوقع:** تحسين 50% في الأداء

---

## 🎯 مؤشرات الأداء المستهدفة

### الوضع الحالي (تقديري)
- **First Contentful Paint (FCP):** ~1.8s
- **Largest Contentful Paint (LCP):** ~2.5s
- **Time to Interactive (TTI):** ~3.2s
- **Total Blocking Time (TBT):** ~400ms
- **Cumulative Layout Shift (CLS):** ~0.15

### الهدف بعد التحسينات
- **FCP:** < 1.0s ⚡
- **LCP:** < 1.5s ⚡
- **TTI:** < 2.0s ⚡
- **TBT:** < 200ms ⚡
- **CLS:** < 0.1 ⚡

---

## 🔧 أدوات المراقبة الموصى بها

### 1. **Lighthouse CI**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-app.vercel.app
            https://your-app.vercel.app/shop
```

### 2. **Bundle Analyzer**
```bash
# تشغيل التحليل
ANALYZE=true npm run build

# سيفتح تقرير تفاعلي في المتصفح
```

### 3. **React DevTools Profiler**
```typescript
// إضافة profiling في development
if (process.env.NODE_ENV === 'development') {
  const { Profiler } = await import('react');
  // استخدم Profiler لقياس أداء المكونات
}
```

---

## 📚 مراجع إضافية

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Bundle Size Optimization](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

---

**آخر تحديث:** 23 أكتوبر 2025
