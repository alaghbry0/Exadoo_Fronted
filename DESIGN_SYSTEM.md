# 🎨 نظام التصميم - Exadoo

> **دليل المطور للممارسات والقواعد الإلزامية**  
> **الإصدار:** 3.1  
> **آخر تحديث:** 29 أكتوبر 2025

---

## 🎯 البداية السريعة

قبل كتابة أي كود:
1. ✅ راجع القواعد الذهبية أدناه
2. ✅ شغّل `npm run migration:scan` (أو `migration:scan:json` لوكلاء Codex)
3. ✅ اتبع الـ Checklist
4. ✅ استخدم `shadowClasses` و `componentRadius` و `gradients` و `withAlpha` من `@/styles/tokens`

---

## ⚡ القواعد الذهبية (غير قابلة للتفاوض)

1) **الملف ≤ ~300 سطر**  
   قسّم الملف إلى subcomponents/hooks إذا اقترب من 300 سطر.

2) **Design Tokens دائمًا**  
   - لا للألوان/الخلفيات/الحدود/الظلال/التباعد الصريحة.  
   - استخدم:  
     ```ts
     import { colors, spacing, radius, shadowClasses, withAlpha, gradients } from '@/styles/tokens';
     ```
   - **مسموح من Tailwind**: Utilities للـ Layout فقط (flex/grid/cols/justify/items/gap responsive/overflow).  
   - **ممنوع**: ألوان/ظلال/حدود/تباعدات رقمية (p-*, m-*, gap-*… إلخ) و `dark:`.

3) **الحركات (Animations)**  
   - لا تُعرّف كائنات motion inline.  
   - استخدم `@/styles/animations` (variants أعيد استخدامها).  
   - عناصر motion المشروطة يجب أن تُغلّف بـ `AnimatePresence`.  
   - تجنّب تحريك `width/height`؛ استخدم transform.

4) **توحيد UI Primitives**  
   - جميع الـ primitives من: `src/shared/components/ui/*` (shadcn-based).  
   - المكونات المخصّصة (composites) تبقى داخل `src/domains/<domain>/components`.

5) **البنية**  
   - كود المجالات: `src/domains/<domain>/**`  
   - المشتركات: `src/shared/**`  
   - الاستيرادات دائمًا عبر aliases: `@/...`  
   - امتنع عن المسارات النسبية المعمّقة.

6) **الوصول (A11y)**  
   - أزرار بالأيقونات فقط: أضف `aria-label`.  
   - عناصر تفاعلية قابلة للتركيز؛ حالات تركيز مرئية عبر tokens.  
   - عناصر دلالية (`<button>`, `<a>`, `<h*>`).

7) **RTL + Mobile-first**  
   - التوافق RTL افتراضي.  
   - صمّم أولًا للمحمول.

---

## 📐 استخدام Design Tokens

### الألوان
```ts
import { colors, withAlpha, gradients } from '@/styles/tokens';

colors.text.primary / secondary / tertiary / inverse
colors.bg.primary / secondary / tertiary / elevated
colors.border.default
colors.status.success / warning / error
withAlpha(colors.brand.primary, 0.12)
gradients.brand.primary / primaryHover / primaryActive
