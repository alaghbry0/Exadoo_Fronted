# 🎨 دليل استخدام Design Tokens

> دليل شامل لاستبدال الأنماط المباشرة بـ Design Tokens

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [أنماط الاستبدال](#أنماط-الاستبدال)
3. [أمثلة عملية](#أمثلة-عملية)
4. [الملفات المطلوب تحديثها](#الملفات-المطلوب-تحديثها)
5. [أفضل الممارسات](#أفضل-الممارسات)

---

## 🎯 نظرة عامة

### **لماذا Design Tokens؟**

- ✅ **توحيد الأنماط** عبر المشروع
- ✅ **سهولة الصيانة** - تغيير واحد يؤثر على كل شيء
- ✅ **Dark Mode** مدمج تلقائياً
- ✅ **Type Safety** مع TypeScript
- ✅ **Performance** - CSS Variables أسرع

### **ما هي Design Tokens المتاحة؟**

```typescript
import {
  colors,        // الألوان
  typography,    // الخطوط
  spacing,       // المسافات
  shadows,       // الظلال
  animations,    // الحركات
  componentRadius, // الزوايا
  shadowClasses  // فئات الظلال
} from '@/styles/tokens';
```

---

## 🔄 أنماط الاستبدال

### 1️⃣ **الألوان (Colors)**

#### ❌ قبل:
```typescript
<div className="text-gray-900 dark:text-white">
<div className="bg-white dark:bg-neutral-900">
<div className="border-gray-200 dark:border-neutral-800">
```

#### ✅ بعد (الطريقة 1 - Inline Styles):
```typescript
import { colors } from '@/styles/tokens';

<div style={{ color: colors.text.primary }}>
<div style={{ backgroundColor: colors.bg.primary }}>
<div style={{ borderColor: colors.border.default }}>
```

#### ✅ بعد (الطريقة 2 - CSS Variables):
```typescript
<div className="text-[var(--color-text-primary)]">
<div className="bg-[var(--color-bg-primary)]">
<div className="border-[var(--color-border-default)]">
```

---

### 2️⃣ **الخطوط (Typography)**

#### ❌ قبل:
```typescript
<h1 className="text-3xl font-bold">
<p className="text-sm text-gray-600">
```

#### ✅ بعد:
```typescript
import { typography } from '@/styles/tokens';

<h1 className={typography.heading.xl}>
<p className={typography.body.sm} style={{ color: colors.text.secondary }}>
```

---

### 3️⃣ **المسافات (Spacing)**

#### ❌ قبل:
```typescript
<div className="p-4 mb-6 gap-3">
```

#### ✅ بعد:
```typescript
import { spacing } from '@/styles/tokens';

<div style={{
  padding: spacing[4],
  marginBottom: spacing[6],
  gap: spacing[3]
}}>
```

---

### 4️⃣ **الظلال (Shadows)**

#### ❌ قبل:
```typescript
<div className="shadow-md hover:shadow-lg">
```

#### ✅ بعد (الطريقة 1):
```typescript
import { shadows, shadowClasses } from '@/styles/tokens';

<div className={shadowClasses.card}>
```

#### ✅ بعد (الطريقة 2):
```typescript
<div style={{ boxShadow: shadows.elevation[2] }}>
```

---

### 5️⃣ **الزوايا (Border Radius)**

#### ❌ قبل:
```typescript
<div className="rounded-lg">
<div className="rounded-2xl">
```

#### ✅ بعد:
```typescript
import { componentRadius } from '@/styles/tokens';

<div className={componentRadius.card}>
<div className={componentRadius.button}>
```

---

## 💡 أمثلة عملية

### **مثال 1: Card Component**

#### ❌ قبل:
```typescript
const Card = ({ children }) => (
  <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-md p-6 text-gray-900 dark:text-white">
    {children}
  </div>
);
```

#### ✅ بعد:
```typescript
import { colors, spacing, componentRadius, shadowClasses } from '@/styles/tokens';

const Card = ({ children }) => (
  <div 
    className={`${componentRadius.card} ${shadowClasses.card}`}
    style={{
      backgroundColor: colors.bg.elevated,
      borderColor: colors.border.default,
      padding: spacing[6],
      color: colors.text.primary,
      border: '1px solid'
    }}
  >
    {children}
  </div>
);
```

---

### **مثال 2: Button Component**

#### ❌ قبل:
```typescript
const Button = ({ children }) => (
  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm">
    {children}
  </button>
);
```

#### ✅ بعد:
```typescript
import { colors, spacing, componentRadius, shadows } from '@/styles/tokens';

const Button = ({ children }) => (
  <button 
    className={`${componentRadius.button} transition-all duration-200`}
    style={{
      backgroundColor: colors.primary[500],
      color: colors.text.inverse,
      padding: `${spacing[2]} ${spacing[4]}`,
      boxShadow: shadows.elevation[1]
    }}
  >
    {children}
  </button>
);
```

---

### **مثال 3: Text Component**

#### ❌ قبل:
```typescript
const Text = ({ children }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      العنوان
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {children}
    </p>
  </div>
);
```

#### ✅ بعد:
```typescript
import { colors, typography, spacing } from '@/styles/tokens';

const Text = ({ children }) => (
  <div>
    <h2 
      className={typography.heading.lg}
      style={{ 
        color: colors.text.primary,
        marginBottom: spacing[4]
      }}
    >
      العنوان
    </h2>
    <p 
      className={typography.body.sm}
      style={{ color: colors.text.secondary }}
    >
      {children}
    </p>
  </div>
);
```

---

### **مثال 4: Form Input**

#### ❌ قبل:
```typescript
const Input = (props) => (
  <input 
    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);
```

#### ✅ بعد:
```typescript
import { colors, spacing, componentRadius } from '@/styles/tokens';

const Input = (props) => (
  <input 
    className={`${componentRadius.input} w-full transition-all duration-200 focus:ring-2`}
    style={{
      padding: `${spacing[2]} ${spacing[4]}`,
      border: `1px solid ${colors.border.default}`,
      backgroundColor: colors.bg.primary,
      color: colors.text.primary,
      '--tw-ring-color': colors.primary[500]
    } as React.CSSProperties}
    {...props}
  />
);
```

---

## 📂 الملفات المطلوب تحديثها

### **Priority 1 - Core Components (10 ملفات):**

#### **Payment Components:**
```
✅ src/components/PaymentHistoryItem.tsx (تم)
src/features/payments/components/DetailRow.tsx
src/features/payments/components/PaymentCard.tsx
```

#### **Notification Components:**
```
✅ src/features/notifications/components/NotificationItem.tsx (تم)
src/features/notifications/components/NotificationFilter.tsx
```

#### **Profile Components:**
```
src/features/profile/components/ProfileHeader.tsx
src/features/profile/components/SubscriptionsSection.tsx
```

#### **Auth Components:**
```
src/features/auth/components/GlobalAuthSheet.tsx
src/features/auth/components/UnlinkedStateBanner.tsx
```

---

### **Priority 2 - Page Components (15 ملف):**

#### **Academy Pages:**
```
src/pages/academy/index.tsx
src/pages/academy/course/[id].tsx
src/pages/academy/bundle/[id].tsx
src/pages/academy/category/[id].tsx
```

#### **Shop Pages:**
```
src/pages/shop/index.tsx
src/pages/shop/signals.tsx
```

#### **Trading Pages:**
```
src/pages/forex.tsx
src/pages/indicators.tsx
```

---

### **Priority 3 - Shared Components (20 ملف):**

#### **Common Components:**
```
src/shared/components/common/ServiceCardV2.tsx
src/shared/components/common/SkeletonLoaders.tsx
src/shared/components/common/InviteAlert.tsx
```

#### **Layout Components:**
```
src/shared/components/layout/Navbar.tsx
src/shared/components/layout/NavbarEnhanced.tsx
src/shared/components/layout/BackHeader.tsx
src/shared/components/layout/FooterNav.tsx
```

---

## 🎨 جدول الألوان المتاحة

### **Text Colors:**
```typescript
colors.text.primary      // النص الرئيسي
colors.text.secondary    // النص الثانوي
colors.text.tertiary     // النص الثالث
colors.text.inverse      // نص معكوس (أبيض على داكن)
colors.text.disabled     // نص معطل
colors.text.link         // روابط
colors.text.linkHover    // روابط عند hover
```

### **Background Colors:**
```typescript
colors.bg.primary        // خلفية رئيسية
colors.bg.secondary      // خلفية ثانوية
colors.bg.elevated       // خلفية مرتفعة (كروت)
colors.bg.overlay        // خلفية overlay
colors.bg.disabled       // خلفية معطلة
```

### **Border Colors:**
```typescript
colors.border.default    // حدود افتراضية
colors.border.hover      // حدود عند hover
colors.border.focus      // حدود عند focus
colors.border.disabled   // حدود معطلة
colors.border.error      // حدود خطأ
```

### **Status Colors:**
```typescript
colors.status.success       // نجاح
colors.status.successBg     // خلفية نجاح
colors.status.warning       // تحذير
colors.status.warningBg     // خلفية تحذير
colors.status.error         // خطأ
colors.status.errorBg       // خلفية خطأ
```

---

## 📏 جدول المسافات المتاحة

```typescript
spacing[0]   // 0px
spacing[1]   // 4px
spacing[2]   // 8px
spacing[3]   // 12px
spacing[4]   // 16px
spacing[5]   // 20px
spacing[6]   // 24px
spacing[8]   // 32px
spacing[10]  // 40px
spacing[12]  // 48px
spacing[16]  // 64px
spacing[20]  // 80px
```

---

## 🎭 جدول الظلال المتاحة

### **Elevation Shadows:**
```typescript
shadows.elevation[0]  // لا ظل
shadows.elevation[1]  // ظل خفيف
shadows.elevation[2]  // ظل متوسط
shadows.elevation[3]  // ظل قوي
shadows.elevation[4]  // ظل قوي جداً
```

### **Shadow Classes:**
```typescript
shadowClasses.card       // ظل الكروت
shadowClasses.button     // ظل الأزرار
shadowClasses.dropdown   // ظل القوائم المنسدلة
shadowClasses.modal      // ظل النوافذ المنبثقة
```

---

## ✅ أفضل الممارسات

### **1. استخدم Inline Styles للقيم الديناميكية:**
```typescript
// ✅ جيد
<div style={{ 
  color: colors.text.primary,
  padding: spacing[4]
}}>

// ❌ تجنب
<div className="text-gray-900 p-4">
```

### **2. استخدم CSS Variables للقيم الثابتة:**
```typescript
// ✅ جيد
<div className="text-[var(--color-text-primary)] p-[var(--spacing-4)]">

// ✅ أيضاً جيد
<div style={{ color: colors.text.primary }}>
```

### **3. استخدم Component Variants للأنماط المتكررة:**
```typescript
// ✅ جيد
import { componentVariants } from '@/components/ui/variants';

<div className={componentVariants.card.base}>

// ❌ تجنب
<div className="bg-white dark:bg-neutral-900 border rounded-2xl shadow-md">
```

### **4. احتفظ بـ Tailwind للـ Utilities:**
```typescript
// ✅ جيد - استخدم Tailwind للـ utilities
<div 
  className="flex items-center gap-2 transition-all duration-200"
  style={{ color: colors.text.primary }}
>

// ❌ تجنب - لا تستخدم Tailwind للألوان
<div className="flex items-center gap-2 text-gray-900">
```

---

## 🧪 الاختبار

بعد كل تحديث:

### **1. تحقق من Dark Mode:**
```bash
# افتح المتصفح وبدّل بين Light/Dark Mode
# تأكد من أن الألوان تتغير بشكل صحيح
```

### **2. تحقق من Console:**
```bash
# لا توجد أخطاء
# لا توجد تحذيرات
```

### **3. تحقق من Build:**
```bash
npm run build
```

---

## 📊 تتبع التقدم

### **Checklist:**

#### **Core Components (10):**
- ✅ PaymentHistoryItem.tsx
- [ ] DetailRow.tsx
- [ ] PaymentCard.tsx
- ✅ NotificationItem.tsx
- [ ] NotificationFilter.tsx
- [ ] ProfileHeader.tsx
- [ ] SubscriptionsSection.tsx
- [ ] GlobalAuthSheet.tsx
- [ ] UnlinkedStateBanner.tsx

#### **Page Components (15):**
- [ ] academy/index.tsx
- [ ] academy/course/[id].tsx
- [ ] academy/bundle/[id].tsx
- [ ] academy/category/[id].tsx
- [ ] shop/index.tsx
- [ ] shop/signals.tsx
- [ ] forex.tsx
- [ ] indicators.tsx

#### **Shared Components (20):**
- [ ] ServiceCardV2.tsx
- [ ] SkeletonLoaders.tsx
- [ ] InviteAlert.tsx
- [ ] Navbar.tsx
- [ ] NavbarEnhanced.tsx
- [ ] BackHeader.tsx
- [ ] FooterNav.tsx

---

## 🎯 الخلاصة

**الوقت المقدر للتطبيق الكامل:** 4-6 ساعات

**الأولويات:**
1. 🔴 Core Components (2 ساعة)
2. 🟡 Page Components (2 ساعة)
3. 🟢 Shared Components (2 ساعة)

**نصيحة:** ابدأ بملف واحد، اختبره، ثم انتقل للتالي!

---

**آخر تحديث:** 23 أكتوبر 2025
