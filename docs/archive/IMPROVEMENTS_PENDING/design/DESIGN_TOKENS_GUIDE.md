# 📖 دليل Design Tokens - مرجع سريع

> **النطاق:** كيفية استخدام Design Tokens بشكل صحيح  
> **الحجم:** 100-150 سطر

---

## 🎯 ما هي Design Tokens؟

**Design Tokens** = قيم تصميم موحدة قابلة لإعادة الاستخدام (ألوان، مسافات، ظلال، الخ)

**الفائدة:**
- ✅ Consistency في كل المشروع
- ✅ Dark mode تلقائي
- ✅ تغيير Theme بسهولة
- ✅ Maintenance أسهل

---

## 🎨 الألوان (Colors)

### الاستخدام
```tsx
import { colors } from '@/styles/tokens';

// ❌ خطأ - Hard-coded
<div className="text-gray-900 dark:text-white">
<div style={{ color: '#0a0a0a' }}>

// ✅ صحيح - Design Tokens
<div style={{ color: colors.text.primary }}>
<p style={{ color: colors.text.secondary }}>
```

### الأنواع المتاحة
```tsx
// النصوص
colors.text.primary      // النص الرئيسي (أسود → أبيض في Dark)
colors.text.secondary    // نص ثانوي (رمادي داكن → رمادي فاتح)
colors.text.tertiary     // نص خفيف

// الخلفيات
colors.bg.primary        // الخلفية الرئيسية
colors.bg.secondary      // خلفية ثانوية
colors.bg.elevated       // خلفية مرتفعة (Cards, Modals)

// الحدود
colors.border.default    // حدود عادية
colors.border.hover      // حدود عند التمرير

// الحالات
colors.status.success    // أخضر (نجاح)
colors.status.error      // أحمر (خطأ)
colors.status.warning    // أصفر (تحذير)
colors.status.info       // أزرق (معلومات)

// العلامة التجارية
colors.brand.primary     // #0084FF
colors.brand.secondary   // #8B5CF6
```

---

## 📐 المسافات (Spacing)

### 8-point grid system
```tsx
import { spacing } from '@/styles/tokens';

// ❌ خطأ - Hard-coded
<div className="p-5"> // 20px (ليس مضاعف 8)
<div style={{ padding: '18px' }}>

// ✅ صحيح - Design Tokens
<div style={{ padding: spacing[4] }}>  // 16px
<div style={{ padding: spacing[6] }}>  // 24px
<div style={{ padding: spacing[8] }}>  // 32px
```

### القيم المتاحة
```tsx
spacing[2]   // 8px   (صغير جداً)
spacing[4]   // 16px  (صغير)
spacing[6]   // 24px  (متوسط) ⭐ الأكثر استخداماً
spacing[8]   // 32px  (كبير)
spacing[12]  // 48px  (كبير جداً)
```

**💡 نصيحة:** استخدم مضاعفات 8 دائماً (8, 16, 24, 32...)

---

## 🌗 الظلال (Shadows)

### الاستخدام
```tsx
import { shadowClasses } from '@/styles/tokens';

// ❌ خطأ - Hard-coded
<Card className="shadow-lg">
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

// ✅ صحيح - Shadow Classes
<Card className={shadowClasses.card}>
<Card className={shadowClasses.cardHover}>
<Card className={shadowClasses.cardElevated}>
```

### الأنواع المتاحة
```tsx
shadowClasses.card         // ظل بطاقة عادي
shadowClasses.cardHover    // ظل عند التمرير
shadowClasses.cardElevated // ظل مرتفع
shadowClasses.modal        // ظل Modal/Dialog
shadowClasses.dropdown     // ظل Dropdown/Menu
```

---

## 🔤 Typography

### الاستخدام
```tsx
import { typography } from '@/styles/tokens';

// Headings
<h1 className={typography.heading.xl}>عنوان كبير</h1>
<h2 className={typography.heading.lg}>عنوان</h2>
<h3 className={typography.heading.md}>عنوان متوسط</h3>

// Body Text
<p className={typography.body.lg}>نص كبير</p>
<p className={typography.body.md}>نص عادي</p>
<p className={typography.body.sm}>نص صغير</p>
```

---

## ✅ أمثلة عملية

### مثال 1: بطاقة (Card)
```tsx
import { colors, spacing, shadowClasses } from '@/styles/tokens';

<Card 
  className={shadowClasses.card}
  style={{ 
    padding: spacing[6],
    backgroundColor: colors.bg.elevated
  }}
>
  <h3 style={{ color: colors.text.primary }}>
    العنوان
  </h3>
  <p style={{ color: colors.text.secondary }}>
    الوصف
  </p>
</Card>
```

### مثال 2: زر (Button) مخصص
```tsx
<button
  style={{
    padding: `${spacing[3]} ${spacing[6]}`,
    backgroundColor: colors.brand.primary,
    color: colors.text.primary,
    borderRadius: '0.75rem'
  }}
  className={shadowClasses.card}
>
  اضغط هنا
</button>
```

---

## 🚫 الأخطاء الشائعة

### خطأ 1: استخدام dark: classes
```tsx
// ❌ خطأ
<div className="text-gray-900 dark:text-white bg-white dark:bg-neutral-900">

// ✅ صحيح
import { colors } from '@/styles/tokens';
<div style={{ 
  color: colors.text.primary,
  background: colors.bg.primary 
}}>
```

### خطأ 2: قيم غير متناسقة
```tsx
// ❌ خطأ - قيم عشوائية
<div style={{ padding: '18px' }}>    // 18 ليس مضاعف 8
<div style={{ padding: '22px' }}>    // 22 ليس مضاعف 8

// ✅ صحيح - مضاعفات 8
<div style={{ padding: spacing[4] }}>  // 16px
<div style={{ padding: spacing[6] }}>  // 24px
```

---

## 🔧 Checklist

قبل Commit:
- [ ] لا توجد hard-coded colors
- [ ] لا توجد dark: classes
- [ ] كل المسافات مضاعفات 8
- [ ] استخدمت shadowClasses
- [ ] `npm run migration:scan` ✅

---

**راجع:** `DESIGN_SYSTEM.md` للقواعد الكاملة
