# 🚀 خطة العمل التفصيلية (Action Plan)

> **تاريخ:** 24 أكتوبر 2025  
> **المدة الإجمالية:** 8-10 أسابيع  
> **الأولوية:** حرجة

---

## 📅 الجدول الزمني

### الأسبوع 1-2: إصلاحات حرجة 🔴

#### اليوم 1-2: تقسيم shop/index.tsx
```bash
# المهمة
تقسيم 719 سطر إلى 4 مكونات

# الملفات الجديدة
src/pages/shop/components/
├── ShopHero.tsx          (150 سطر)
├── ShopGrid.tsx          (200 سطر)
├── ShopFilters.tsx       (150 سطر)
└── ShopFeatured.tsx      (150 سطر)

# الوقت المقدر
8 ساعات

# التأثير
⚡ +35% أداء
📦 -25% bundle size
```

**الخطوات:**
1. ✅ قراءة shop/index.tsx وتحديد الأقسام
2. ✅ إنشاء ShopHero.tsx (Hero section)
3. ✅ إنشاء ShopGrid.tsx (Products grid)
4. ✅ إنشاء ShopFilters.tsx (Filters sidebar)
5. ✅ إنشاء ShopFeatured.tsx (Featured section)
6. ✅ تحديث shop/index.tsx لاستخدام المكونات الجديدة
7. ✅ اختبار

---

#### اليوم 3-4: تقسيم forex.tsx و indicators.tsx
```bash
# forex.tsx (485 سطر)
forex/components/
├── ForexHero.tsx         (120 سطر)
├── ForexCharts.tsx       (150 سطر)
├── ForexSignals.tsx      (150 سطر)

# indicators.tsx (487 سطر)
indicators/components/
├── IndicatorsHero.tsx    (120 سطر)
├── IndicatorsGrid.tsx    (180 سطر)
├── IndicatorsFeatures.tsx (150 سطر)

# الوقت المقدر
8 ساعات

# التأثير
⚡ +30% أداء
```

---

#### اليوم 5: إنشاء Animation System
```typescript
// src/styles/animations.ts
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  },
  
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  },
  
  stagger: {
    container: {
      animate: { transition: { staggerChildren: 0.1 } }
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 }
    }
  }
};

# الوقت المقدر
3 ساعات

# التأثير
🎨 consistency 100%
```

---

### الأسبوع 3-4: تطبيق Design Tokens 🟡

#### الملفات المستهدفة (أعلى 10 ملفات):
```
1. shop/index.tsx        (71 color)  - 2.5 ساعة
2. indicators.tsx        (70 color)  - 2.5 ساعة
3. forex.tsx             (62 color)  - 2 ساعة
4. academy/index.tsx     (45 color)  - 2 ساعة
5. profile.tsx           (38 color)  - 1.5 ساعة
6. payment-history.tsx   (35 color)  - 1.5 ساعة
7. notifications.tsx     (32 color)  - 1.5 ساعة
8. shop/signals.tsx      (30 color)  - 1 ساعة
9. payment-exchange.tsx  (28 color)  - 1 ساعة
10. index.tsx            (25 color)  - 1 ساعة

# الوقت الإجمالي
17 ساعة (أسبوعان)

# التأثير
🎨 visual consistency 95%+
```

**الخطوات لكل ملف:**
```tsx
// 1. Import tokens
import { colors, spacing, typography } from '@/styles/tokens';

// 2. استبدل hard-coded colors
// ❌ قبل
<div className="text-gray-900 dark:text-white">

// ✅ بعد
<div style={{ color: colors.text.primary }}>

// 3. استبدل dark: classes
// ❌ قبل
<div className="bg-white dark:bg-neutral-900">

// ✅ بعد
<div style={{ background: colors.bg.primary }}>

// 4. اختبر في Light & Dark mode
npm run dev

// 5. تحقق من Auto Scanner
npm run migration:scan
```

---

### الأسبوع 5-6: تحسينات UX 🟢

#### أسبوع 5: Micro-interactions و Loading States

**اليوم 1-2: Micro-interactions**
```tsx
// src/components/ui/variants.ts
export const interactionVariants = {
  button: "transform hover:scale-105 active:scale-95 transition-all duration-200",
  card: "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
  link: "transition-colors hover:text-primary-600"
};

# تطبيق في:
- كل الأزرار (20 مكون)
- كل البطاقات (30 مكون)
- كل الروابط (50 مكان)

# الوقت المقدر
8 ساعات
```

**اليوم 3-5: Loading States**
```tsx
// 1. استبدال Spinners بـ Skeletons
// ❌ قبل
if (isLoading) return <Spinner />

// ✅ بعد
if (isLoading) return <GridSkeleton count={6} />

// 2. إضافة Optimistic UI
const { mutate } = useMutation({
  onMutate: async (newData) => {
    queryClient.setQueryData(['items'], (old) => [...old, newData]);
  }
});

// 3. Stale-while-revalidate
const { data } = useQuery('items', fetchItems, {
  staleTime: 30000
});

# الوقت المقدر
10 ساعات
```

---

#### أسبوع 6: Error Handling و Forms

**اليوم 1-2: Error Handling**
```tsx
// src/shared/components/common/ErrorState.tsx
export const ErrorState = ({ error, onRetry, onGoBack }) => (
  <div className="text-center py-12">
    <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">عذراً!</h3>
    <p className="text-gray-600 mb-6">{getMessage(error)}</p>
    <div className="flex gap-3 justify-center">
      {onRetry && <Button onClick={onRetry}>حاول مرة أخرى</Button>}
      {onGoBack && <Button variant="outline" onClick={onGoBack}>العودة</Button>}
    </div>
  </div>
);

# الوقت المقدر
8 ساعات
```

**اليوم 3-5: Forms Improvement**
```tsx
// 1. Inline validation
// 2. Auto-save
// 3. Password strength
// 4. Character counter

# الوقت المقدر
10 ساعات
```

---

### الأسبوع 7-8: UI Consistency 🎨

#### أسبوع 7: توحيد الأنماط

**المهام:**
```
✅ توحيد Shadows              (4 ساعات)
✅ توحيد Border Radius       (2 ساعات)
✅ توحيد Typography           (4 ساعات)
✅ توحيد Spacing              (4 ساعات)
✅ Component Variants         (6 ساعات)
```

**الأدوات:**
```typescript
// src/styles/tokens/index.ts
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './radius';

// src/components/ui/variants.ts
export const componentVariants = {
  button: { ... },
  card: { ... },
  badge: { ... }
};
```

---

#### أسبوع 8: Dark Mode و Accessibility

**Dark Mode:**
```css
/* تحسين Contrast ratios */
.dark {
  --color-bg-secondary: #171717;
  --color-text-secondary: #a3a3a3;
  --color-border: #262626;
}

# الوقت المقدر
6 ساعات
```

**Accessibility:**
```bash
# 1. Setup
npm install -D @axe-core/playwright

# 2. Automated testing
npm run test:a11y

# 3. إصلاح المشاكل
- إضافة aria-labels
- تحسين focus states
- إصلاح keyboard navigation

# الوقت المقدر
10 ساعات
```

---

### الأسبوع 9-10: Optimization و Testing 🚀

#### أسبوع 9: Performance Optimization

**المهام:**
```
✅ Bundle analysis            (2 ساعات)
✅ Code splitting             (6 ساعات)
✅ Memoization               (6 ساعات)
✅ Image optimization        (4 ساعات)
```

**الأدوات:**
```bash
# Bundle analyzer
npm run analyze

# Lighthouse
npm run lighthouse

# Core Web Vitals
npm run dev
# افتح Chrome DevTools > Lighthouse
```

---

#### أسبوع 10: Testing و Documentation

**المهام:**
```
✅ Visual regression tests    (6 ساعات)
✅ Accessibility tests        (4 ساعات)
✅ تحديث Documentation        (6 ساعات)
✅ Style Guide                (4 ساعات)
```

---

## 📊 التقدم المتوقع

### بعد 2 أسابيع:
- ✅ ملفات ضخمة مقسمة
- ✅ Animation system موحد
- 📊 Progress: 20%

### بعد 4 أسابيع:
- ✅ Design tokens مطبقة
- ✅ Visual consistency 95%+
- 📊 Progress: 50%

### بعد 6 أسابيع:
- ✅ UX محسّنة
- ✅ Loading و Error handling ممتاز
- 📊 Progress: 75%

### بعد 8 أسابيع:
- ✅ UI consistency 95%+
- ✅ Accessibility AAA
- 📊 Progress: 90%

### بعد 10 أسابيع:
- ✅ Performance optimized
- ✅ مختبر بالكامل
- 📊 Progress: 100% ✨

---

## ✅ Checklist يومي

### قبل البدء:
- [ ] git pull origin main
- [ ] npm run migration:scan
- [ ] قراءة DESIGN_SYSTEM.md

### أثناء العمل:
- [ ] اتباع قاعدة 300 سطر
- [ ] استخدام Design Tokens
- [ ] اختبار في Light & Dark
- [ ] اختبار على Mobile

### قبل Commit:
- [ ] npm run lint
- [ ] npm run migration:scan
- [ ] npm run test:visual
- [ ] مراجعة bundle size

---

## 📈 KPIs

### Performance:
- Lighthouse Score: 95%+
- Core Web Vitals: All green
- Bundle Size: < 500KB

### UX:
- Task Completion: +25%
- User Satisfaction: +35%
- Bounce Rate: -20%

### Quality:
- Visual Consistency: 95%+
- Accessibility: AAA
- Code Quality: A+

---

**ابدأ الآن:** راجع `UX_ISSUES.md` و `UI_ISSUES.md`
