# 🔍 دليل استخدام Auto Scanner للكشف عن الملفات التي تحتاج Design Tokens

> أداة ذكية تفحص جميع ملفات المشروع وتكتشف الملفات التي تحتاج تطبيق Design Tokens

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [كيفية الاستخدام](#كيفية-الاستخدام)
3. [فهم النتائج](#فهم-النتائج)
4. [خطوات التطبيق](#خطوات-التطبيق)
5. [أمثلة عملية](#أمثلة-عملية)

---

## 🎯 نظرة عامة

### **ماذا تفعل الأداة؟**

Auto Scanner يفحص **جميع ملفات TypeScript/TSX** في مجلد `src/` ويكتشف:

- ✅ **Dark mode classes** (`dark:text-white`, `dark:bg-neutral-900`)
- ✅ **Hard-coded colors** (`text-gray-900`, `bg-white`, `border-gray-200`)
- ✅ **Hard-coded spacing** (`p-4`, `m-6`, `gap-3`)
- ✅ **Inline colors** (`#0084FF`, `rgb(255, 87, 34)`)

### **لماذا نحتاجها؟**

بدلاً من البحث يدوياً في مئات الملفات، الأداة:
- 🔍 تفحص **كل الملفات** تلقائياً
- 📊 تحسب **درجة أولوية** لكل ملف (0-100)
- ⏱️ تقدر **الوقت المطلوب** للتطبيق
- 🎯 ترجع **أفضل 3-5 ملفات** للتطبيق اليدوي

---

## 🚀 كيفية الاستخدام

### **الطريقة 1: npm script (موصى به)**

```bash
npm run migration:scan
```

### **الطريقة 2: مباشرة**

```bash
ts-node scripts/migration-dashboard.ts --scan
```

### **الطريقة 3: من داخل dashboard**

```bash
npm run migration:dashboard -- --scan
```

---

## 📊 فهم النتائج

### **مثال على المخرجات:**

```
╔════════════════════════════════════════════════════════════╗
║     🎨 Design Tokens Migration Dashboard                  ║
╚════════════════════════════════════════════════════════════╝

🔍 Auto-Scan Results:

  Found 122 files that need migration

📋 Top Priority Files (Ready for Manual Migration):

  1. 🔴 HIGH GlobalAuthSheet.tsx [Score: 100]
     src/features/auth/components/GlobalAuthSheet.tsx
     Category: Auth | Time: ~19min
     Issues: 18 dark: classes, 30 hard-coded colors, 7 spacing values
     Examples: dark:bg-neutral-, dark:hover, dark:bg-amber-

  2. 🔴 HIGH UnlinkedStateBanner.tsx [Score: 100]
     src/features/auth/components/UnlinkedStateBanner.tsx
     Category: Auth | Time: ~16min
     Issues: 15 dark: classes, 12 hard-coded colors, 19 spacing values
     Examples: dark:from-primary-, dark:via-neutral-, dark:to-primary-

  3. 🟡 MED PaymentCard.tsx [Score: 45]
     src/features/payments/components/PaymentCard.tsx
     Category: Payment | Time: ~12min
     Issues: 8 dark: classes, 15 hard-coded colors
     Examples: dark:text-white, text-gray-600, bg-white

⏱️  Estimated time for top 5: ~133 minutes
```

---

## 🎨 فهم الأيقونات والألوان

### **Priority Indicators:**

| أيقونة | المستوى | Score Range | الوصف |
|--------|----------|-------------|--------|
| 🔴 HIGH | عالي جداً | 50-100 | **أولوية قصوى** - يحتوي على many dark: classes |
| 🟡 MED | متوسط | 25-49 | **أولوية متوسطة** - hard-coded colors |
| 🟢 LOW | منخفض | 0-24 | **أولوية منخفضة** - مشاكل بسيطة |

### **Score Calculation:**

```typescript
Score = (dark: classes × 5) + 
        (hard-coded colors × 2) + 
        (spacing values × 1) + 
        (inline styles × 3)
```

**مثال:**
- `dark:` classes: 18 → 18 × 5 = **90**
- Hard-coded colors: 30 → 30 × 2 = **60**
- Spacing: 7 → 7 × 1 = **7**
- **Total Score: 100** (capped at 100)

---

## 📂 Categories

الأداة تصنف الملفات تلقائياً:

| Category | المجلدات |
|----------|----------|
| **Payment** | `src/features/payments/`, `src/components/Payment*` |
| **Notification** | `src/features/notifications/` |
| **Profile** | `src/features/profile/` |
| **Auth** | `src/features/auth/` |
| **Academy** | `src/pages/academy/` |
| **Shop** | `src/pages/shop/` |
| **Trading** | `src/pages/forex.tsx`, `src/pages/indicators.tsx` |
| **Layout** | `src/shared/components/layout/` |
| **Common** | `src/shared/components/common/` |
| **Other** | باقي الملفات |

---

## 🛠️ خطوات التطبيق اليدوي

### **1. شغّل Scanner**
```bash
npm run migration:scan
```

### **2. اختر ملف من القائمة**
ابدأ بالملف الذي له **أعلى Score** (🔴 HIGH)

### **3. افتح الملف في IDE**
```bash
code src/features/auth/components/GlobalAuthSheet.tsx
```

### **4. طبّق Design Tokens**

#### **قبل:**
```tsx
<div className="text-gray-900 dark:text-white bg-white dark:bg-neutral-900">
```

#### **بعد:**
```tsx
import { colors } from '@/styles/tokens';

<div style={{ color: colors.text.primary, backgroundColor: colors.bg.primary }}>
```

### **5. احفظ واختبر**
```bash
npm run dev
# افتح http://localhost:3000 وتأكد أن كل شيء يعمل
```

### **6. اختبر Visual Regression (اختياري)**
```bash
npm run test:visual:update  # أول مرة
npm run test:visual          # بعد التغييرات
```

### **7. Commit**
```bash
git add src/features/auth/components/GlobalAuthSheet.tsx
git commit -m "feat: migrate GlobalAuthSheet to Design Tokens"
```

---

## 📝 أمثلة عملية

### **مثال 1: ملف بسيط (Score: 25)**

**النتيجة:**
```
  1. 🟢 LOW Button.tsx [Score: 25]
     src/components/ui/Button.tsx
     Category: Components | Time: ~8min
     Issues: 5 hard-coded colors, 3 spacing values
     Examples: text-gray-700, bg-white, p-4
```

**التطبيق:**
```tsx
// قبل
<button className="px-4 py-2 bg-white text-gray-700 border-gray-200">

// بعد
import { colors, spacing } from '@/styles/tokens';

<button 
  style={{ 
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.bg.primary,
    color: colors.text.secondary,
    borderColor: colors.border.default
  }}
>
```

---

### **مثال 2: ملف متوسط (Score: 55)**

**النتيجة:**
```
  2. 🔴 HIGH Card.tsx [Score: 55]
     src/components/ui/Card.tsx
     Category: Components | Time: ~15min
     Issues: 12 dark: classes, 8 hard-coded colors
     Examples: dark:bg-neutral-900, dark:text-white, text-gray-600
```

**التطبيق:**
```tsx
// قبل
<div className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
  <h3 className="text-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-400">

// بعد
import { colors } from '@/styles/tokens';

<div style={{ 
  backgroundColor: colors.bg.primary, 
  borderColor: colors.border.default 
}}>
  <h3 style={{ color: colors.text.primary }}>
  <p style={{ color: colors.text.secondary }}>
```

---

### **مثال 3: ملف معقد (Score: 100)**

**النتيجة:**
```
  3. 🔴 HIGH index.tsx [Score: 100]
     src/pages/academy/index.tsx
     Category: Academy | Time: ~54min
     Issues: 47 dark: classes, 73 hard-coded colors, 40 spacing values
     Examples: dark:text-emerald-, dark:text-amber-, dark:bg-neutral-950
```

**الاستراتيجية:**
1. افتح الملف
2. ابحث عن `dark:` (47 موقع)
3. قسّم العمل على **3 جلسات**:
   - جلسة 1 (20 دقيقة): Header & Navigation
   - جلسة 2 (20 دقيقة): Cards & Badges  
   - جلسة 3 (14 دقيقة): Forms & Buttons

---

## ⚙️ كيف تعمل الأداة؟

### **Detection Patterns:**

```typescript
const DETECTION_PATTERNS = {
  // Dark mode classes (أولوية عالية)
  darkMode: /dark:[a-z-]+/g,
  
  // Hard-coded colors
  hardCodedColors: /(?:text|bg|border)-(?:gray|slate|neutral|white|black)-\d+/g,
  
  // Hard-coded spacing
  hardCodedSpacing: /(?:p|m|gap|space)-\d+/g,
  
  // Inline hex/rgb colors
  inlineColors: /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g,
};
```

### **Skip Logic:**

الأداة **تتخطى** الملفات التي:
- ✅ تستخدم Design Tokens بالفعل (`from '@/styles/tokens'`)
- ✅ ملفات الاختبار (`.spec.ts`, `.test.tsx`)
- ✅ Type definitions (`.d.ts`)
- ✅ لا تحتوي على مشاكل (score = 0)

---

## 🎯 التوصيات

### **للمشاريع الكبيرة (100+ ملف):**

1. **Week 1:** أعلى 10 ملفات (Score 80-100)
2. **Week 2:** متوسط 15 ملف (Score 50-79)
3. **Week 3:** منخفض 20 ملف (Score 25-49)
4. **Week 4:** باقي الملفات

### **للمشاريع الصغيرة (< 50 ملف):**

- خذ أفضل 5 ملفات يومياً
- ~2-3 ساعات / يوم
- انتهي في أسبوع واحد

### **Best Practices:**

- ✅ اعمل على ملف واحد في المرة
- ✅ اختبر بعد كل ملف
- ✅ Commit بعد كل نجاح
- ✅ استخدم dashboard لتتبع التقدم
- ✅ شغّل visual tests دورياً

---

## 📊 إحصائيات النتائج الأولية

### **المشروع الحالي:**

```
Total files scanned: 122 files
Total issues found: ~3,400+ issues
Estimated total time: ~30-35 hours

Breakdown by Priority:
🔴 HIGH (50-100):   45 files (~15 hours)
🟡 MED (25-49):     38 files (~10 hours)
🟢 LOW (0-24):      39 files (~8 hours)
```

### **Top Categories:**

| Category | Files | Avg Score |
|----------|-------|-----------|
| Academy | 18 | 85 |
| Auth | 12 | 92 |
| Payment | 15 | 78 |
| Shop | 8 | 88 |
| Layout | 10 | 65 |

---

## 🔧 Troubleshooting

### **Problem: "Module type warning"**

```bash
(node:xxx) Warning: Module type of file:///...
```

**الحل:** تجاهله - مجرد warning ولا يؤثر على عمل الأداة.

---

### **Problem: "Scan too slow"**

**الحل:** الأداة تفحص ~120 ملف في ~2-3 ثواني. إذا أبطأ:
1. تأكد من عدم وجود `node_modules` في `src/`
2. قلّل عدد الملفات في `src/`

---

### **Problem: "False positives"**

بعض الملفات قد تظهر لكنها لا تحتاج migration (مثل: componentVariants)

**الحل:** راجع الملف يدوياً قبل التطبيق.

---

## 🚀 الخطوات التالية

### **الآن:**
1. شغّل `npm run migration:scan`
2. اختر أول ملف من القائمة
3. طبّق Design Tokens يدوياً
4. اختبر وcCommit

### **المستقبل:**
- [ ] Auto-fix script (تطبيق تلقائي)
- [ ] VS Code extension
- [ ] CI/CD integration
- [ ] Progress tracking

---

## 📚 الموارد ذات الصلة

- **دليل Design Tokens:** `docs/DESIGN_TOKENS_MIGRATION.md`
- **Migration Dashboard:** `npm run migration:dashboard`
- **Visual Tests:** `npm run test:visual`
- **التوثيق الكامل:** `docs/DESIGN_TOKENS_REVIEW.md`

---

**Created:** 24 أكتوبر 2025  
**Last Updated:** 24 أكتوبر 2025  
**Version:** 1.0.0  
**Author:** Migration Assistant

---

## 💡 نصيحة نهائية

> **"Don't try to migrate everything at once!"**
> 
> ابدأ بملف واحد، اختبره، وإذا تمام كمّل. التطبيق التدريجي أفضل من التطبيق السريع الخاطئ!

🎉 **Happy Migrating!**
