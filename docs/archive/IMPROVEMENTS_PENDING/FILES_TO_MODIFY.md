# 📝 قائمة الملفات التي سيتم تعديلها

> **تاريخ:** 23 أكتوبر 2025  
> **إجمالي الملفات:** 30+ ملف

---

## 🔧 ملفات الإعداد (Configuration)

### 1. next.config.ts
**المسار:** `next.config.ts`  
**التعديل:** إضافة Bundle Analyzer  
**الأولوية:** 🔴 عالية جداً

```typescript
// إضافة
import withBundleAnalyzer from '@next/bundle-analyzer'
const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default bundleAnalyzer(nextConfig)

// تحسين اختياري
images: {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920], // إضافة 1920
}
```

### 2. package.json
**المسار:** `package.json`  
**التعديل:** 
1. إضافة script للتحليل
2. إزالة dependencies غير مستخدمة

```json
{
  "scripts": {
    "analyze": "set ANALYZE=true && npm run build"
  },
  "dependencies": {
    // إزالة:
    // "react-icons": "^5.5.0",
    // "recharts": "^3.2.1",
    // "flowbite": "^3.1.2" (إذا لم يكن مستخدماً)
  },
  "devDependencies": {
    // إضافة:
    "@next/bundle-analyzer": "^15.1.6"
  }
}
```

---

## 🆕 ملفات جديدة (New Files)

### 3. useIntersectionObserver.ts
**المسار:** `src/hooks/useIntersectionObserver.ts`  
**الغرض:** Hook للـ Lazy Loading  
**الأولوية:** 🟡 متوسطة

```typescript
// Hook كامل للـ Intersection Observer
// سيتم استخدامه في LazyLoad component
```

### 4. LazyLoad.tsx
**المسار:** `src/components/common/LazyLoad.tsx`  
**الغرض:** مكون Lazy Loading قابل لإعادة الاستخدام  
**الأولوية:** 🟡 متوسطة

```typescript
// مكون wrapper للـ lazy loading
// يستخدم useIntersectionObserver
```

### 5. PERFORMANCE_RESULTS.md
**المسار:** `docs/IMPROVEMENTS_PENDING/PERFORMANCE_RESULTS.md`  
**الغرض:** توثيق نتائج القياسات  
**الأولوية:** 🟢 منخفضة

---

## 🎭 ملفات Modals (Dynamic Import)

### المكونات الرئيسية

#### 6. AcademyPurchaseModal.tsx
**المسار:** `src/components/AcademyPurchaseModal.tsx`  
**الحجم:** 13KB  
**التعديل:** سيتم استيراده ديناميكياً من الملفات التالية:

**الملفات المستوردة منها:**
- `src/pages/academy/bundle/[id].tsx`
- `src/pages/academy/course/[id].tsx`
- `src/pages/academy/index.tsx`

**التعديل في كل ملف:**
```typescript
// ❌ قبل
import AcademyPurchaseModal from '@/components/AcademyPurchaseModal'

// ✅ بعد
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const AcademyPurchaseModal = dynamic(
  () => import('@/components/AcademyPurchaseModal'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }
)
```

#### 7. ExchangePaymentModal.tsx
**المسار:** `src/components/ExchangePaymentModal.tsx`  
**الحجم:** 12KB  
**التعديل:** Dynamic import

**الملفات المستوردة منها:**
- `src/components/AcademyPurchaseModal.tsx` (line 11)
- `src/features/academy/components/AcademyPurchaseModal.tsx`
- `src/features/payments/components/IndicatorsPurchaseModal.tsx`
- `src/features/payments/components/TradingPanelPurchaseModal.tsx`

**التعديل:**
```typescript
// ❌ قبل
import { ExchangePaymentModal } from '@/components/ExchangePaymentModal'

// ✅ بعد
import dynamic from 'next/dynamic'

const ExchangePaymentModal = dynamic(
  () => import('@/components/ExchangePaymentModal').then(mod => ({ 
    default: mod.ExchangePaymentModal 
  })),
  { ssr: false }
)
```

#### 8. SubscriptionModal
**المسار:** `src/features/subscriptions/components/SubscriptionModal.tsx`  
**التعديل:** Dynamic import

**الملفات المستوردة منها:**
- `src/pages/shop/signals.tsx` (line 7)

**التعديل:**
```typescript
// ❌ قبل
import SubscriptionModal from '../../components/SubscriptionModal'

// ✅ بعد
import dynamic from 'next/dynamic'

const SubscriptionModal = dynamic(
  () => import('@/features/subscriptions/components/SubscriptionModal'),
  { ssr: false }
)
```

### المكونات الإضافية

#### 9. UsdtPaymentMethodModal
**المسار:** `src/components/UsdtPaymentMethodModal.tsx`  
**الملفات المستوردة منها:**
- `src/components/AcademyPurchaseModal.tsx` (line 10)
- `src/features/academy/components/AcademyPurchaseModal.tsx`

#### 10. PaymentSuccessModal
**المسار:** `src/components/PaymentSuccessModal.tsx`  
**الملفات المستوردة منها:**
- `src/components/AcademyPurchaseModal.tsx` (line 13)
- `src/features/academy/components/AcademyPurchaseModal.tsx`

#### 11. PaymentExchangeSuccess
**المسار:** `src/components/PaymentExchangeSuccess.tsx`  
**الملفات المستوردة منها:**
- `src/components/AcademyPurchaseModal.tsx` (line 12)
- `src/features/academy/components/AcademyPurchaseModal.tsx`

#### 12. IndicatorsPurchaseModal
**المسار:** `src/components/IndicatorsPurchaseModal.tsx`  
**الحجم:** 8KB

#### 13. TradingPanelPurchaseModal
**المسار:** `src/components/TradingPanelPurchaseModal.tsx`  
**الحجم:** 8KB

**نفس نمط التعديل لجميع Modals:**
```typescript
import dynamic from 'next/dynamic'
const ComponentName = dynamic(() => import('./path'), { ssr: false })
```

---

## 🖼️ ملفات الصور (Image Optimization)

### 14. StickyHeader.tsx
**المسار:** `src/pages/academy/course/components/StickyHeader.tsx`  
**التعديل:** استبدال `<img>` بـ `<Image />`  
**الأولوية:** 🔴 عالية

**التعديل:**
```typescript
// إضافة في البداية
import Image from 'next/image'

// البحث عن <img> واستبداله
// ❌ قبل
<img src={courseImage} alt={courseTitle} className="..." />

// ✅ بعد
<Image 
  src={courseImage} 
  alt={courseTitle}
  width={48}
  height={48}
  className="rounded-lg object-cover"
  loading="lazy"
  quality={85}
/>
```

---

## 🔄 ملفات Lazy Loading

### صفحات الأكاديمية

#### 15. academy/index.tsx
**المسار:** `src/pages/academy/index.tsx`  
**التعديل:** تطبيق LazyLoad على قوائم الكورسات  
**الأولوية:** 🟡 متوسطة

```typescript
import { LazyLoad } from '@/components/common/LazyLoad'

// في render
<LazyLoad fallback={<CourseSkeleton />}>
  <CourseCard course={course} />
</LazyLoad>
```

#### 16. academy/category/[id].tsx
**المسار:** `src/pages/academy/category/[id].tsx`  
**التعديل:** نفس النمط

#### 17. academy/bundle/[id].tsx
**المسار:** `src/pages/academy/bundle/[id].tsx`  
**التعديل:** LazyLoad للمحتوى الثقيل

### صفحات Shop

#### 18. shop/signals.tsx
**المسار:** `src/pages/shop/signals.tsx`  
**التعديل:** LazyLoad لبطاقات الاشتراكات  
**الأولوية:** 🟡 متوسطة

```typescript
import { LazyLoad } from '@/components/common/LazyLoad'

// في map للاشتراكات
{subscriptions.map((sub, index) => (
  <LazyLoad key={sub.id} fallback={<CardSkeleton />}>
    <SubscriptionCard subscription={sub} />
  </LazyLoad>
))}
```

#### 19. shop/index.tsx
**المسار:** `src/pages/shop/index.tsx`  
**التعديل:** نفس النمط

### صفحات Notifications

#### 20. notifications.tsx
**المسار:** `src/pages/notifications.tsx`  
**التعديل:** LazyLoad لقائمة الإشعارات  
**الأولوية:** 🟢 منخفضة

```typescript
import { LazyLoad } from '@/components/common/LazyLoad'

// في map للإشعارات
{notifications.map((notification) => (
  <LazyLoad key={notification.id} fallback={<NotificationSkeleton />}>
    <NotificationItem notification={notification} />
  </LazyLoad>
))}
```

---

## 📄 ملفات الصفحات الأخرى

### 21. index.tsx (الصفحة الرئيسية)
**المسار:** `src/pages/index.tsx`  
**التعديل:** لا يوجد (الصفحة محسّنة بالفعل)  
**الحالة:** ✅ جيد

### 22. profile.tsx
**المسار:** `src/pages/profile.tsx`  
**التعديل:** اختياري - LazyLoad للأقسام الثقيلة  
**الأولوية:** 🟢 منخفضة

### 23. payment-history.tsx
**المسار:** `src/pages/payment-history.tsx`  
**التعديل:** اختياري - LazyLoad للقائمة  
**الأولوية:** 🟢 منخفضة

---

## 📦 ملفات Features (إذا لزم الأمر)

### Academy Feature

#### 24. features/academy/components/AcademyPurchaseModal.tsx
**المسار:** `src/features/academy/components/AcademyPurchaseModal.tsx`  
**التعديل:** نفس تعديلات المكون الأصلي

### Payments Feature

#### 25. features/payments/components/ExchangePaymentModal.tsx
**المسار:** `src/features/payments/components/ExchangePaymentModal.tsx`  
**التعديل:** Dynamic imports للـ modals المستوردة

#### 26. features/payments/components/IndicatorsPurchaseModal.tsx
**المسار:** `src/features/payments/components/IndicatorsPurchaseModal.tsx`  
**التعديل:** Dynamic imports

#### 27. features/payments/components/TradingPanelPurchaseModal.tsx
**المسار:** `src/features/payments/components/TradingPanelPurchaseModal.tsx`  
**التعديل:** Dynamic imports

### Subscriptions Feature

#### 28. features/subscriptions/components/SubscriptionModal.tsx
**المسار:** `src/features/subscriptions/components/SubscriptionModal.tsx`  
**التعديل:** سيتم استيراده ديناميكياً (لا تعديل في الملف نفسه)

---

## 📊 ملخص الإحصائيات

### حسب النوع

| النوع | العدد | الأولوية |
|-------|-------|----------|
| ملفات إعداد | 2 | 🔴 عالية جداً |
| ملفات جديدة | 3 | 🟡 متوسطة |
| Modals (Dynamic) | 13 | 🔴 عالية |
| صور | 1 | 🔴 عالية |
| Lazy Loading | 8 | 🟡 متوسطة |
| توثيق | 1 | 🟢 منخفضة |
| **الإجمالي** | **28** | - |

### حسب الأولوية

| الأولوية | العدد | الملفات |
|----------|-------|---------|
| 🔴 عالية جداً | 16 | Configuration + Modals + Images |
| 🟡 متوسطة | 11 | Lazy Loading + New Components |
| 🟢 منخفضة | 1 | Documentation |

---

## 🎯 ترتيب التنفيذ المقترح
قم بتنفيذ جميع التعديلات مباشرة دفعه واحده في نفس المهمه مع الحرص على التحقق من تطبيقها في كافه ملفات المشروع, واذا كان هناك اي اجزاء ما زالت تحتاج الى تطبيق, اخبرني بها, والملفات التي يجب التطبيق فيها وكيف اقوم بذلك
---

## ⚠️ ملاحظات مهمة

### قبل البدء
```bash
# إنشاء branch جديد
git checkout -b feature/performance-optimization

# Backup
git commit -m "checkpoint: before performance optimization"
```

### أثناء التنفيذ
- ✅ اختبر بعد كل مجموعة من التعديلات
- ✅ احتفظ بـ console مفتوح للأخطاء
- ✅ اختبر على اتصال بطيء (Throttling)

### بعد الانتهاء
```bash
# Build نهائي
npm run build

# Test production
npm run start

# Analyze
npm run analyze
```

---

**آخر تحديث:** 23 أكتوبر 2025  
**الحالة:** ✅ جاهز للتنفيذ  
**إجمالي الملفات:** 28 ملف
