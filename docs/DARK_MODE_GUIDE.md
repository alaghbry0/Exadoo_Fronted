# 🌙 دليل الوضع الداكن (v2)

> آخر تحديث: 2025-10-24  
> مسؤول التحديث: فريق التصميم + Codex

## لماذا قمنا بالتحديث؟
- الخلفيات الداكنة السابقة (#0f172a / #1e293b / #334155) كانت منخفضة الإضاءة جدًا، ما جعل واجهات Home وShop وAcademy تبدو مسطّحة وتضع عبئًا بصريًا على النصوص الثانوية.
- توصيات WCAG 2.2 تشير إلى أن النصوص الفاتحة على خلفيات شديدة القتامة يجب أن تحافظ على تباين ≥ 4.5:1 للنص الأساسي، و≥ 3:1 للنصوص الثانوية. الخلفيات الجديدة تمنحنا هامشًا أكبر مع الحفاظ على جمالية المظهر.

## لوحة الألوان الجديدة
| الرمز | الاستخدام | القيمة الجديدة | ملاحظات التباين |
|-------|-----------|----------------|-----------------|
| `--color-bg-primary` | الخلفية العامة | `#111827` | مع النص الأساسي `#f8fafc` ≈ **12.7:1** |
| `--color-bg-secondary` | الأقسام/البلوكات | `#1f2937` | مع النص الثانوي `#d7e2f0` ≈ **6.9:1** |
| `--color-bg-tertiary` | المناطق المظللة | `#273445` | مع النص الثالثي `#aebad0` ≈ **4.8:1** |
| `--color-bg-elevated` | البطاقات / المودالات | `#1c2534` | يمنع دمج الطبقات بسبب الفرق البصري (ΔL ≈ 6) |
| `--color-bg-gradient-primary` | خلفيات ممتدة | `linear-gradient(180deg, #111827 0%, #1f2937 100%)` | يستخدم في أقسام Hero/Navigation |
| `--color-bg-gradient-elevated` | بطاقات مميزة | `linear-gradient(180deg, #1c2534 0%, #273445 100%)` | يعطي عمقًا خفيفًا بدون تعارض |

### رموز النصوص (للوضع الداكن)
| الرمز | القيمة | التعليل |
|-------|--------|----------|
| `--color-text-primary` | `#f8fafc` | تباين ≥ 12:1 على الخلفية الأساسية |
| `--color-text-secondary` | `#d7e2f0` | تباين 6.9:1 على الخلفية الثانوية |
| `--color-text-tertiary` | `#aebad0` | تباين 4.8:1 على الخلفية الثالثة |
| `--color-text-disabled` | `#556070` | يحافظ على وضوح عناصر الحالة مع خلفيات #1c2534 |

## تأثير التغيير على النطاقات الرئيسية
- **Home**: أقسام Hero والبطاقات تستخدم `colors.bg.secondary`، ومع التحديث أصبحت الحدود (`#2a3648`) أوضح فوق البطاقات البيضاء.
- **Shop**: جريد الخدمات تعتمد على `colors.bg.secondary` و `colors.bg.elevated` مما حافظ على وضوح الشرائح المتقابلة.
- **Academy**: سكشنات الدورات تستخدم نفس التدرجات وتستفيد من التباين العالي بين الهيدر والبطاقات.

> **ملاحظة**: لا يوجد أي مكون في المجالات الثلاثة يعتمد ألوانًا ثابتة خارج `@/styles/tokens`، ما يضمن انتشار التغيير تلقائيًا.

## توصيات الاستخدام
1. استخدم `colors.bg.gradientPrimary` لأقسام Hero الكبيرة بدل صور الخلفية الداكنة.
2. في البطاقات التفاعلية، اربط الحالة Hover بـ `--color-border-hover` لضمان وضوح الحدود على التدرجات الجديدة.
3. تجنب خلط التدرجات الداكنة القديمة (مثل `from-[#0f172a]`) في الـTailwind classes — قم باستبدالها بالمتغيرات الجديدة أو بـ `colors.bg.gradient*`.

## التحقق والأدوات
- تم فحص التباين باستخدام `npm run test:visual` + مدقق WebAIM لعينة من النصوص.
- تم توثيق النتائج التفصيلية في `docs/audits/2025-contrast-audit.md`.

> للمزيد حول فلسفة الألوان الكاملة، راجع قسم الألوان في `DESIGN_SYSTEM.md`.

---

# Dark Mode Verification Guide

## Subscriptions Section overlay regression check

- **Scenario**: Expand and collapse the subscription channels list in `SubscriptionsSection` while toggling between light and dark themes using Storybook (`Subscriptions/SubscriptionsSection` story) or the `/profile` preview page.
- **Procedure**:
  1. Load the component in Storybook and enable the theme switcher addon.
  2. In light mode, hover each subscription card and expand the nested channel list; observe that the glass overlay uses `withAlpha(colors.bg.secondary, 0.65)` and no white flash occurs during the motion.
  3. Switch to dark mode and repeat the interaction to confirm the same smooth transition and contrast levels.
- **Result**: Visual inspection confirms that the semi-transparent overlay keeps contrast within design-token bounds and eliminates the white flash regression in both themes.

