# 🚀 تحسينات الأداء (Performance Optimization)

> **الأولوية:** 🔴 عالية جداً  
> **الوقت المتوقع:** 2-3 أسابيع  
> **التأثير:** كبير على تجربة المستخدم  
> **الحالة:** ⬜ لم يبدأ

---

## 📊 نظرة عامة

هذه المهمة تتطلب تعديلات كبيرة في أجزاء كثيرة من المشروع لتحسين الأداء العام وسرعة التحميل.

---

## 🎯 الأهداف الرئيسية

- ⬜ تطبيق Code Splitting المتقدم
- ⬜ تحسين الصور (Image Optimization)
- ⬜ تحليل وتقليل حجم Bundle
- ⬜ تطبيق Lazy Loading للمكونات الثقيلة

---

## 📦 المهام التفصيلية

### 1️⃣ Code Splitting المتقدم

#### 🎯 الهدف
تقليل حجم JavaScript المحمّل في الصفحة الأولى باستخدام Dynamic Imports.

#### 📝 المكونات المستهدفة للـ Code Splitting

**أولوية عالية:**
- `AcademyPurchaseModal.tsx` - مودال شراء الأكاديمية (ثقيل)
- `SubscriptionModal.tsx` - مودال الاشتراكات
- `UsdtPaymentModal.tsx` - مودال الدفع
- `ExchangePaymentModal.tsx` - مودال الدفع بالعملات
- `Bep20PaymentModal.tsx` - مودال الدفع BEP20

**أولوية متوسطة:**
- مكونات الـ Charts (إن وجدت)
- Video Player في الأكاديمية
- Rich Text Editor (إن وجد)

#### 💻 مثال التطبيق

```tsx
// ❌ قبل - Import عادي
import SubscriptionModal from '@/components/SubscriptionModal'

// ✅ بعد - Dynamic Import
import dynamic from 'next/dynamic'

const SubscriptionModal = dynamic(
  () => import('@/components/SubscriptionModal'),
  {
    loading: () => <CustomSpinner />,
    ssr: false // إذا كان المكون لا يحتاج Server-Side Rendering
  }
)
```

#### 📋 خطوات التنفيذ

1. **تحديد المكونات الثقيلة:**
   ```bash
   npm run build -- --analyze
   ```

2. **تطبيق Dynamic Import:**
   - راجع جميع الصفحات في `src/pages/`
   - حدد المكونات التي لا تظهر فوراً
   - طبق Dynamic Import عليها

3. **اختبار الأداء:**
   - استخدم Chrome DevTools > Performance
   - قس First Contentful Paint (FCP)
   - قس Time to Interactive (TTI)

#### 🎯 النتيجة المتوقعة
- تقليل حجم Initial Bundle بنسبة 30-40%
- تحسين First Load من ~3s إلى ~1.5s

---

### 2️⃣ Image Optimization الشامل

#### 🎯 الهدف
استبدال جميع `<img>` بـ `next/image` لتحسين تحميل الصور.

#### 📝 الصور المستهدفة

**في المشروع حالياً:**
- `/public/background.jpg`
- `/public/11.png`
- صور الـ players
- أيقونات وشعارات متعددة

#### 💻 مثال التطبيق

```tsx
// ❌ قبل
<img src="/background.jpg" alt="Background" />

// ✅ بعد
import Image from 'next/image'

<Image
  src="/background.jpg"
  alt="Background"
  width={1920}
  height={1080}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // optional
  quality={85}
  priority={false} // true فقط للصور Above the Fold
/>
```

#### 📋 خطوات التنفيذ

1. **مراجعة شاملة:**
   ```bash
   # ابحث عن جميع استخدامات <img>
   grep -r "<img" src/
   ```

2. **استبدال تدريجي:**
   - ابدأ بالصفحة الرئيسية (`index.tsx`)
   - ثم صفحات المنتجات والخدمات
   - أخيراً المكونات الفرعية

3. **إضافة Blur Placeholders:**
   ```bash
   # استخدم أداة لتوليد blur placeholders
   npm install plaiceholder
   ```

4. **تحسين next.config.ts:**
   ```typescript
   // next.config.ts
   const nextConfig = {
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
       minimumCacheTTL: 60,
     },
   }
   ```

#### 🎯 النتيجة المتوقعة
- تقليل حجم الصور بنسبة 50-70%
- تحسين Largest Contentful Paint (LCP)
- دعم تلقائي لـ WebP و AVIF

---

### 3️⃣ Bundle Analysis وتحسين

#### 🎯 الهدف
تحليل حجم الـ Bundle وتحديد المكتبات الكبيرة غير الضرورية.

#### 📋 خطوات التنفيذ

1. **تثبيت أداة التحليل:**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

2. **تحديث next.config.ts:**
   ```typescript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   })

   module.exports = withBundleAnalyzer(nextConfig)
   ```

3. **تشغيل التحليل:**
   ```bash
   ANALYZE=true npm run build
   ```

4. **مراجعة النتائج:**
   - افتح التقرير في المتصفح
   - حدد المكتبات الكبيرة (> 100KB)
   - ابحث عن بدائل أخف

#### 🔍 مكتبات مشتبه بها (من package.json):

```json
{
  "framer-motion": "^12.4.10",      // ~100KB - استخدم فقط ما تحتاجه
  "recharts": "^3.2.1",             // ~150KB - استخدم dynamic import
  "react-icons": "^5.5.0",          // كبير - استخدم lucide-react فقط
  "flowbite": "^3.1.2"              // ~80KB - قد لا تحتاجه مع shadcn/ui
}
```

#### 💡 توصيات التحسين

1. **إزالة المكتبات المكررة:**
   - لديك `react-icons` و `lucide-react` - اختر واحدة فقط
   - `flowbite` قد يكون مكرر مع Radix UI

2. **Tree Shaking:**
   ```tsx
   // ❌ سيء - يستورد كل المكتبة
   import * as Icons from 'lucide-react'

   // ✅ جيد - يستورد فقط ما تحتاجه
   import { Activity, BadgePercent } from 'lucide-react'
   ```

3. **Code Splitting للمكتبات الكبيرة:**
   ```tsx
   // Recharts - استخدم فقط عند الحاجة
   const Chart = dynamic(() => import('@/components/Chart'), {
     ssr: false
   })
   ```

#### 🎯 النتيجة المتوقعة
- تقليل Bundle Size بنسبة 20-30%
- إزالة 2-3 مكتبات غير مستخدمة
- تحسين Tree Shaking

---

### 4️⃣ Lazy Loading للمكونات الثقيلة

#### 🎯 الهدف
تحميل المكونات الثقيلة فقط عند الحاجة.

#### 📝 استراتيجيات Lazy Loading

**1. Intersection Observer للمكونات:**
```tsx
import { useEffect, useRef, useState } from 'react'

const LazyComponent = () => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {isVisible ? <HeavyComponent /> : <Skeleton />}
    </div>
  )
}
```

**2. Route-based Code Splitting:**
```tsx
// في Next.js تلقائياً لكل صفحة
// لكن يمكن تحسينه بـ:
const AcademyPage = dynamic(() => import('@/pages/academy'))
const ShopPage = dynamic(() => import('@/pages/shop'))
```

**3. Component-level Lazy Loading:**
```tsx
// للمكونات الثقيلة داخل الصفحة
const VideoPlayer = dynamic(
  () => import('@/components/VideoPlayer'),
  { loading: () => <VideoSkeleton /> }
)
```

#### 📋 المكونات المستهدفة

- ✅ `AcademyPurchaseModal` - يظهر عند الضغط فقط
- ✅ `SubscriptionModal` - يظهر عند الضغط فقط
- ✅ `PaymentModals` - جميعها
- ✅ `NotificationToast` - يظهر عند الحاجة
- ✅ Video Players - ثقيل جداً

---

## 📊 قياس الأداء

### قبل التحسينات (متوقع):
```
Lighthouse Score: ~60-70
First Load JS: ~300-400 KB
First Contentful Paint: ~2-3s
Time to Interactive: ~3-4s
```

### بعد التحسينات (هدف):
```
Lighthouse Score: >90
First Load JS: <200 KB
First Contentful Paint: <1.5s
Time to Interactive: <2s
```

### أدوات القياس:
1. **Lighthouse** (Chrome DevTools)
2. **WebPageTest.org**
3. **Next.js Analytics** (Vercel)
4. **Bundle Analyzer**

---

## 🚦 خطة التنفيذ المقترحة

قم بتنفيذ جميع التعديلات مباشرة دفعه واحده في نفس المهمه مع الحرص على التحقق من تطبيقها في كافه ملفات المشروع, واذا كان هناك اي اجزاء ما زالت تحتاج الى تطبيق, اخبرني بها, والملفات التي يجب التطبيق فيها وكيف اقوم بذلك

---

## ⚠️ ملاحظات مهمة

1. **اختبر بعد كل تغيير** - لا تطبق كل شيء مرة واحدة
2. **احتفظ بنسخة احتياطية** - استخدم Git branches
3. **قس الأداء قبل وبعد** - لتأكيد التحسين
4. **راجع الـ Console** - تأكد من عدم وجود أخطاء

---

## 📚 مراجع مفيدة

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Next.js Code Splitting](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Analyzer Guide](https://www.npmjs.com/package/@next/bundle-analyzer)

---

**آخر تحديث:** 23 أكتوبر 2025  
**المسؤول:** -  
**الحالة:** ⬜ جاهز للبدء
