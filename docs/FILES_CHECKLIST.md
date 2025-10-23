# ✅ قائمة الملفات - خطة التنفيذ الشاملة

> قائمة تفصيلية بجميع الملفات التي تحتاج تحديث

---

## 📊 الإحصائيات

- **✅ تم التنفيذ:** 8 ملفات
- **⏳ قيد الانتظار:** 60+ ملف
- **📦 إجمالي:** ~68 ملف

---

## 1️⃣ Core Files (الأساسية)

### ✅ تم التنفيذ

- [x] `src/pages/_app.tsx` - تحسين Prefetch
- [x] `src/core/api/client.ts` - استبدال axios
- [x] `src/core/api/fetchClient.ts` - **جديد**
- [x] `src/styles/globals.css` - CSS Variables + Animations
- [x] `src/styles/tokens/colors.ts` - **جديد**
- [x] `src/styles/tokens/spacing.ts` - **جديد**
- [x] `src/styles/tokens/typography.ts` - **جديد**
- [x] `src/styles/tokens/shadows.ts` - **جديد**
- [x] `src/styles/tokens/animations.ts` - **جديد**
- [x] `src/styles/tokens/radius.ts` - **جديد**
- [x] `src/styles/tokens/index.ts` - **جديد**
- [x] `src/components/ui/variants.ts` - **جديد**
- [x] `src/hooks/useSubscriptions.ts` - **جديد**

---

## 2️⃣ Layout Components

### ⏳ قيد الانتظار

- [ ] `src/shared/components/layout/FooterNav.tsx`
  - **التغيير:** استخدام Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/shared/components/layout/Header.tsx` (إن وجد)
  - **التغيير:** استخدام Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

---

## 3️⃣ UI Components (shadcn/ui)

### ⏳ قيد الانتظار

- [ ] `src/components/ui/button.tsx`
  - **التغيير:** استخدام Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/components/ui/card.tsx`
  - **التغيير:** استخدام Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/components/ui/input.tsx`
  - **التغيير:** استخدام Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/components/ui/badge.tsx`
  - **التغيير:** استخدام Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/components/ui/alert.tsx`
  - **التغيير:** استخدام Component Variants
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/components/ui/dialog.tsx`
  - **التغيير:** CSS Animations بدلاً من framer-motion
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

---

## 4️⃣ Features - Notifications

### ⏳ قيد الانتظار

- [ ] `src/features/notifications/components/NotificationItem.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة
  - **ملاحظة:** استخدام `animate-slide-up`

- [ ] `src/features/notifications/components/NotificationFilter.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/notifications/components/NotificationToast.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

---

## 5️⃣ Features - Payments

### ⏳ قيد الانتظار

- [ ] `src/features/payments/components/PaymentHistoryItem.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/features/payments/components/DetailRow.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/payments/components/PaymentSuccessModal.tsx`
  - **التغيير:** ⚠️ احتفظ بـ framer-motion (حركات معقدة)
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق (مراجعة فقط)

- [ ] `src/features/payments/components/ExchangePaymentModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/payments/components/IndicatorsPurchaseModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/payments/components/TradingPanelPurchaseModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/payments/components/UsdtPaymentMethodModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

---

## 6️⃣ Features - Subscriptions

### ⏳ قيد الانتظار

- [ ] `src/features/subscriptions/components/SubscriptionPlanCard.tsx`
  - **التغيير:** CSS Animations + Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/features/subscriptions/components/PlanFeaturesList.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/subscriptions/components/SubscriptionModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/features/subscriptions/components/SubscribeFab.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/subscriptions/components/PaymentButtons.tsx`
  - **التغيير:** Component Variants
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/subscriptions/components/TieredDiscountInfo.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق

---

## 7️⃣ Features - Profile

### ⏳ قيد الانتظار

- [ ] `src/features/profile/components/ProfileHeader.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/features/profile/components/SubscriptionsSection.tsx`
  - **التغيير:** CSS Animations + useSubscriptions hook
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 20 دقيقة
  - **ملاحظة:** استخدام `useSubscriptions` الجديد

---

## 8️⃣ Features - Academy

### ⏳ قيد الانتظار

- [ ] `src/features/academy/components/AcademyPurchaseModal.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

---

## 9️⃣ Features - Auth

### ⏳ قيد الانتظار

- [ ] `src/features/auth/components/GlobalAuthSheet.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/features/auth/components/UnlinkedStateBanner.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

---

## 🔟 Pages - Main

### ⏳ قيد الانتظار

- [ ] `src/pages/index.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 30 دقيقة
  - **ملاحظة:** صفحة رئيسية - مهمة جداً

- [ ] `src/pages/notifications.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/pages/notifications/[id].tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/pages/profile.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/pages/plans.tsx`
  - **التغيير:** CSS Animations + Component Variants
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 25 دقيقة

- [ ] `src/pages/payment-history.tsx`
  - **التغيير:** Design Tokens + fetch client
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

---

## 1️⃣1️⃣ Pages - Shop

### ⏳ قيد الانتظار

- [ ] `src/pages/shop/index.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 25 دقيقة

- [ ] `src/pages/shop/signals.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

---

## 1️⃣2️⃣ Pages - Academy

### ⏳ قيد الانتظار

- [ ] `src/pages/academy/index.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 30 دقيقة

- [ ] `src/pages/academy/course/[id].tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🔴 عالية
  - **الوقت المقدر:** 40 دقيقة
  - **ملاحظة:** صفحة معقدة - راجع كل animation

- [ ] `src/pages/academy/course/components/CourseSidebar.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/pages/academy/course/components/CurriculumList.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 15 دقيقة

- [ ] `src/pages/academy/course/components/StatChip.tsx`
  - **التغيير:** CSS Animations
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/pages/academy/course/components/StickyHeader.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

- [ ] `src/pages/academy/course/components/TitleMeta.tsx`
  - **التغيير:** Design Tokens
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق

- [ ] `src/pages/academy/bundle/[id].tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/pages/academy/category/[id].tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

---

## 1️⃣3️⃣ Pages - Trading

### ⏳ قيد الانتظار

- [ ] `src/pages/forex.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/pages/indicators.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

---

## 1️⃣4️⃣ Shared Components

### ⏳ قيد الانتظار

- [ ] `src/shared/components/common/SmartImage.tsx`
  - **التغيير:** تحسين blur placeholders
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 20 دقيقة

- [ ] `src/shared/components/common/CustomSpinner.tsx`
  - **التغيير:** ⚠️ احتفظ بـ framer-motion
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق (مراجعة فقط)

- [ ] `src/shared/components/common/Spinner.tsx`
  - **التغيير:** ⚠️ احتفظ بـ framer-motion
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق (مراجعة فقط)

- [ ] `src/shared/components/common/SplashScreen.tsx`
  - **التغيير:** ⚠️ احتفظ بـ framer-motion
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق (مراجعة فقط)

- [ ] `src/shared/components/common/InviteAlert.tsx`
  - **التغيير:** CSS Animations + Design Tokens
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 10 دقيقة

---

## 1️⃣5️⃣ Splash Screen Components

### ⏳ قيد الانتظار

- [ ] `src/components/splash-screen/AuroraBackground.tsx`
  - **التغيير:** ⚠️ احتفظ بـ framer-motion (حركات معقدة)
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 5 دقائق (مراجعة فقط)

---

## 1️⃣6️⃣ Fonts

### ⏳ قيد الانتظار

- [ ] تحويل `public/fonts/Almarai-Light.ttf` → WOFF2
- [ ] تحويل `public/fonts/Almarai-Regular.ttf` → WOFF2
- [ ] تحويل `public/fonts/Almarai-Bold.ttf` → WOFF2
- [ ] تحويل `public/fonts/Almarai-ExtraBold.ttf` → WOFF2
- [ ] تحويل `public/fonts/Outfit-Regular.ttf` → WOFF2
- [ ] تحويل `public/fonts/Outfit-Medium.ttf` → WOFF2
- [ ] تحويل `public/fonts/Orlean-Regular.otf` → WOFF2
- [ ] تحديث `src/styles/globals.css` (السطور 79-85)

**الأولوية:** 🔴 عالية جداً  
**الوقت المقدر:** 30 دقيقة  
**التأثير:** ⬇️ تقليل 600KB

---

## 1️⃣7️⃣ Monitoring & Tools

### ⏳ قيد الانتظار

- [ ] إضافة `.github/workflows/lighthouse.yml`
  - **الأولوية:** 🟢 منخفضة
  - **الوقت المقدر:** 15 دقيقة

- [ ] تحديث `package.json` scripts
  - **الأولوية:** 🟡 متوسطة
  - **الوقت المقدر:** 5 دقائق

---

## 📊 ملخص الأولويات

### 🔴 أولوية عالية (15 ملف):
- Layout Components (2)
- UI Components (4)
- Main Pages (5)
- Feature Components (4)
- **الوقت المقدر الإجمالي:** ~5 ساعات

### 🟡 أولوية متوسطة (35 ملف):
- Feature Components (20)
- Page Components (10)
- Shared Components (5)
- **الوقت المقدر الإجمالي:** ~7 ساعات

### 🟢 أولوية منخفضة (10 ملفات):
- Complex Animations (5)
- Monitoring Tools (2)
- Misc (3)
- **الوقت المقدر الإجمالي:** ~1.5 ساعة

---

## ⏱️ الوقت الإجمالي المقدر

- **أولوية عالية:** ~5 ساعات
- **أولوية متوسطة:** ~7 ساعات
- **أولوية منخفضة:** ~1.5 ساعة
- **الخطوط:** ~0.5 ساعة
- **📊 الإجمالي:** **~14 ساعة**

---

## 🎯 خطة التنفيذ الموصى بها

### اليوم 1 (4 ساعات):
- ✅ تحويل الخطوط إلى WOFF2
- ✅ Layout Components
- ✅ UI Components الأساسية

### اليوم 2 (4 ساعات):
- ✅ Main Pages (index, notifications, profile, plans)
- ✅ Feature Components (Notifications, Payments)

### اليوم 3 (3 ساعات):
- ✅ Feature Components (Subscriptions, Profile)
- ✅ Academy Pages

### اليوم 4 (3 ساعات):
- ✅ Remaining Pages
- ✅ Shared Components
- ✅ Testing & Verification

---

**آخر تحديث:** 23 أكتوبر 2025
