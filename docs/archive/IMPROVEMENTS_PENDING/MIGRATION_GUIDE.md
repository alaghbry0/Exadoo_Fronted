# 🔄 دليل الترحيل والتطبيق

> دليل شامل لتطبيق التحسينات على كافة ملفات المشروع

---

## 📋 جدول المحتويات

1. [استبدال framer-motion بـ CSS](#1-استبدال-framer-motion)
2. [استخدام Design Tokens](#2-استخدام-design-tokens)
3. [تطبيق Component Variants](#3-تطبيق-component-variants)
4. [تحويل الخطوط](#4-تحويل-الخطوط)
5. [قائمة الملفات المتأثرة](#5-قائمة-الملفات-المتأثرة)

---

## 1. استبدال framer-motion

### 🎯 الهدف
تقليل Bundle Size بـ ~60KB واستخدام CSS animations الأخف

### 📝 متى تستخدم CSS بدلاً من framer-motion؟

#### ✅ استخدم CSS للحركات البسيطة:
- Fade in/out
- Slide up/down/left/right
- Scale in/out
- Simple transitions

#### ❌ احتفظ بـ framer-motion للحركات المعقدة:
- Drag and drop
- Gestures (swipe, pan)
- Complex animations with multiple steps
- Physics-based animations
- AnimatePresence مع exit animations معقدة

### 🔄 أمثلة التحويل

#### مثال 1: Fade In
```typescript
// ❌ قبل
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  المحتوى
</motion.div>

// ✅ بعد
<div className="animate-fade-in">
  المحتوى
</div>
```

#### مثال 2: Slide Up
```typescript
// ❌ قبل
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  المحتوى
</motion.div>

// ✅ بعد
<div className="animate-slide-up">
  المحتوى
</div>
```

#### مثال 3: Scale In
```typescript
// ❌ قبل
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  المحتوى
</motion.div>

// ✅ بعد
<div className="animate-scale-in">
  المحتوى
</div>
```

#### مثال 4: Staggered Children (احتفظ بـ framer-motion)
```typescript
// ✅ احتفظ بـ framer-motion لهذا
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 📦 الملفات التي يجب تحديثها

#### **Features Components** (20 ملف):
```
src/features/notifications/components/
  - NotificationItem.tsx ✅ بسيط - استخدم CSS
  - NotificationFilter.tsx ✅ بسيط - استخدم CSS

src/features/payments/components/
  - PaymentHistoryItem.tsx ✅ بسيط - استخدم CSS
  - DetailRow.tsx ✅ بسيط - استخدم CSS
  - PaymentSuccessModal.tsx ⚠️ معقد - احتفظ بـ framer-motion

src/features/subscriptions/components/
  - SubscriptionPlanCard.tsx ✅ بسيط - استخدم CSS
  - PlanFeaturesList.tsx ✅ بسيط - استخدم CSS
  - SubscriptionModal.tsx ⚠️ معقد - احتفظ بـ framer-motion

src/features/profile/components/
  - ProfileHeader.tsx ✅ بسيط - استخدم CSS
  - SubscriptionsSection.tsx ✅ بسيط - استخدم CSS
```

#### **Page Components** (15 ملف):
```
src/pages/
  - index.tsx ✅ بسيط - استخدم CSS
  - notifications.tsx ✅ بسيط - استخدم CSS
  - shop/index.tsx ✅ بسيط - استخدم CSS

src/pages/academy/
  - index.tsx ✅ بسيط - استخدم CSS
  - course/[id].tsx ⚠️ مختلط - راجع كل animation
  - course/components/StatChip.tsx ✅ بسيط - استخدم CSS
```

#### **Shared Components** (10 ملفات):
```
src/shared/components/common/
  - CustomSpinner.tsx ⚠️ احتفظ بـ framer-motion
  - SplashScreen.tsx ⚠️ احتفظ بـ framer-motion
```

---

## 2. استخدام Design Tokens

### 🎯 الهدف
توحيد الألوان والمسافات عبر المشروع

### 📝 كيفية الاستخدام

#### الطريقة 1: CSS Variables (موصى بها)
```typescript
// في JSX
<div className="text-[var(--color-text-primary)] bg-[var(--color-bg-primary)]">
  المحتوى
</div>

// في Tailwind classes
<div className="border-[var(--color-border-default)]">
```

#### الطريقة 2: Style Props
```typescript
import { colors, spacing } from '@/styles/tokens';

<div style={{
  color: colors.text.primary,
  backgroundColor: colors.bg.primary,
  padding: spacing[4],
}}>
  المحتوى
</div>
```

#### الطريقة 3: Tailwind Config (للمستقبل)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        // ...
      }
    }
  }
}

// الاستخدام
<div className="text-text-primary bg-bg-primary">
```

### 🔄 أمثلة التحويل

#### مثال 1: Text Colors
```typescript
// ❌ قبل
<p className="text-gray-900 dark:text-white">النص</p>

// ✅ بعد
<p className="text-[var(--color-text-primary)]">النص</p>

// أو
<p style={{ color: colors.text.primary }}>النص</p>
```

#### مثال 2: Background Colors
```typescript
// ❌ قبل
<div className="bg-white dark:bg-gray-900">المحتوى</div>

// ✅ بعد
<div className="bg-[var(--color-bg-primary)]">المحتوى</div>
```

#### مثال 3: Borders
```typescript
// ❌ قبل
<div className="border border-gray-200 dark:border-gray-700">

// ✅ بعد
<div className="border border-[var(--color-border-default)]">
```

### 📦 الملفات ذات الأولوية العالية

```
src/shared/components/layout/
  - FooterNav.tsx
  - Header.tsx

src/components/ui/
  - button.tsx
  - card.tsx
  - input.tsx
  - badge.tsx

src/features/*/components/
  - جميع المكونات الأساسية
```

---

## 3. تطبيق Component Variants

### 🎯 الهدف
توحيد أنماط المكونات وتسهيل الصيانة

### 📝 كيفية الاستخدام

```typescript
import { componentVariants, mergeVariants } from '@/components/ui/variants';

// مثال 1: Card
<div className={mergeVariants(
  componentVariants.card.base,
  componentVariants.card.elevated,
  'custom-additional-classes'
)}>
  المحتوى
</div>

// مثال 2: Button
<button className={mergeVariants(
  componentVariants.button.base,
  componentVariants.button.primary,
  sizeVariants.button.md
)}>
  انقر هنا
</button>

// مثال 3: Badge
<span className={mergeVariants(
  componentVariants.badge.base,
  componentVariants.badge.success
)}>
  نجح
</span>
```

### 🔄 أمثلة التحويل

#### مثال 1: Card Component
```typescript
// ❌ قبل
<div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
  المحتوى
</div>

// ✅ بعد
import { componentVariants } from '@/components/ui/variants';

<div className={`${componentVariants.card.base} ${componentVariants.card.elevated} rounded-2xl`}>
  المحتوى
</div>
```

#### مثال 2: Button Component
```typescript
// ❌ قبل
<button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl hover:from-primary-600 hover:to-primary-700 active:scale-95 transition-all">
  انقر
</button>

// ✅ بعد
<button className={`${componentVariants.button.base} ${componentVariants.button.primary} ${sizeVariants.button.md} rounded-xl`}>
  انقر
</button>
```

---

## 4. تحويل الخطوط

### 🎯 الهدف
تقليل حجم الخطوط من ~800KB إلى ~200KB

### 📝 الخطوات

#### الخطوة 1: تحويل الخطوط إلى WOFF2

**الأدوات الموصى بها:**
- https://transfonter.org/
- https://everythingfonts.com/ttf-to-woff2
- https://cloudconvert.com/ttf-to-woff2

**الملفات المطلوب تحويلها:**
```
public/fonts/
  - Almarai-Light.ttf → Almarai-Light.woff2
  - Almarai-Regular.ttf → Almarai-Regular.woff2
  - Almarai-Bold.ttf → Almarai-Bold.woff2
  - Almarai-ExtraBold.ttf → Almarai-ExtraBold.woff2
  - Outfit-Regular.ttf → Outfit-Regular.woff2
  - Outfit-Medium.ttf → Outfit-Medium.woff2
  - Orlean-Regular.otf → Orlean-Regular.woff2
```

#### الخطوة 2: تحديث globals.css

```css
/* ❌ قبل */
@font-face { 
  font-family: 'Almarai'; 
  font-weight: 300; 
  src: url('/fonts/Almarai-Light.ttf') format('truetype'); 
  font-display: swap; 
}

/* ✅ بعد */
@font-face { 
  font-family: 'Almarai'; 
  font-weight: 300; 
  src: url('/fonts/Almarai-Light.woff2') format('woff2'); 
  font-display: swap; 
}
```

#### الخطوة 3: Font Subsetting (اختياري)

استخدم أداة مثل `glyphhanger` لتقليل الحجم أكثر:

```bash
npm install -g glyphhanger

# للأحرف العربية فقط
glyphhanger --subset=public/fonts/Almarai-Regular.ttf --formats=woff2 --unicodes=U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF
```

---

## 5. قائمة الملفات المتأثرة

### 🔴 أولوية عالية (يجب تحديثها أولاً)

#### Core Files:
```
✅ src/pages/_app.tsx - تم التحديث
✅ src/core/api/client.ts - تم التحديث
✅ src/styles/globals.css - تم التحديث
⏳ src/styles/tokens/* - تم الإنشاء (جاهز للاستخدام)
```

#### Layout Components:
```
⏳ src/shared/components/layout/FooterNav.tsx
⏳ src/shared/components/layout/Header.tsx
```

#### UI Components:
```
⏳ src/components/ui/button.tsx
⏳ src/components/ui/card.tsx
⏳ src/components/ui/input.tsx
⏳ src/components/ui/badge.tsx
⏳ src/components/ui/alert.tsx
```

### 🟡 أولوية متوسطة

#### Feature Components:
```
⏳ src/features/notifications/components/NotificationItem.tsx
⏳ src/features/notifications/components/NotificationFilter.tsx
⏳ src/features/payments/components/PaymentHistoryItem.tsx
⏳ src/features/subscriptions/components/SubscriptionPlanCard.tsx
⏳ src/features/profile/components/ProfileHeader.tsx
```

#### Page Components:
```
⏳ src/pages/index.tsx
⏳ src/pages/notifications.tsx
⏳ src/pages/shop/index.tsx
⏳ src/pages/academy/index.tsx
```

### 🟢 أولوية منخفضة

#### Remaining Components:
```
⏳ جميع المكونات الأخرى التي تستخدم framer-motion
⏳ المكونات التي لا تحتاج تحديث فوري
```

---

## 📊 تتبع التقدم

### الإحصائيات:
- ✅ **تم:** 8 ملفات
- ⏳ **قيد الانتظار:** ~60 ملف
- 📦 **إجمالي:** ~68 ملف

### النسبة المئوية:
- **المنجز:** ~12%
- **المتبقي:** ~88%

---

## 🔍 كيفية التحقق من التحسينات

### 1. Bundle Size
```bash
npm run analyze
```

### 2. Performance
```bash
# في Chrome DevTools
# Lighthouse > Performance
```

### 3. Network
```bash
# في Chrome DevTools
# Network > تحقق من حجم الملفات
```

---

## ⚠️ تحذيرات مهمة

1. **لا تحذف axios حتى الآن** - تأكد من تحديث جميع الاستخدامات أولاً
2. **لا تحذف framer-motion بالكامل** - بعض المكونات تحتاجه
3. **اختبر كل تغيير** - قبل الانتقال للملف التالي
4. **احتفظ بنسخة احتياطية** - استخدم git commits منتظمة

---

## 📞 المساعدة

إذا واجهت مشاكل:
1. راجع `IMPLEMENTATION_SUMMARY.md`
2. تحقق من console errors
3. راجع الأمثلة في هذا الملف

---

**آخر تحديث:** 23 أكتوبر 2025
