# 🏗️ دليل البنية المعمارية الشامل

> **التحسين:** Feature-Based Architecture  
> **الحالة:** ✅ منفذ بالكامل  
> **المستوى:** متوسط - متقدم

---

## 📊 نظرة عامة

تم إعادة هيكلة المشروع من **Component-Based** إلى **Feature-Based Architecture** لتحسين التنظيم وقابلية التوسع.

---

## 🎯 لماذا Feature-Based?

### ❌ المشكلة (Component-Based):
```
src/components/
├── Navbar.tsx
├── Footer.tsx
├── SubscriptionModal.tsx
├── PaymentModal.tsx
├── ProfileHeader.tsx
├── AcademyCard.tsx
├── ... (50+ components)
└── NotificationItem.tsx
```

**المشاكل:**
- 🔴 صعوبة إيجاد الملفات
- 🔴 كل شيء مختلط
- 🔴 صعوبة الصيانة
- 🔴 صعوبة العمل الجماعي

### ✅ الحل (Feature-Based):
```
src/
├── features/
│   ├── auth/          # كل ما يخص التسجيل
│   ├── subscriptions/ # كل ما يخص الاشتراكات
│   ├── academy/       # كل ما يخص الأكاديمية
│   └── ...
│
├── shared/           # مكونات مشتركة
│   ├── layout/
│   └── common/
│
└── core/             # utilities أساسية
    ├── api/
    └── utils/
```

**الفوائد:**
- ✅ تنظيم منطقي واضح
- ✅ سهولة إيجاد الملفات
- ✅ عزل أفضل
- ✅ عمل فريق موازي

---

## 🏗️ الهيكل الكامل

```
src/
├── features/                    # Features محددة
│   │
│   ├── auth/                   # Authentication
│   │   └── components/
│   │       ├── AuthFab.tsx
│   │       ├── GlobalAuthSheet.tsx
│   │       └── UnlinkedStateBanner.tsx
│   │
│   ├── subscriptions/          # Subscriptions
│   │   └── components/
│   │       ├── SubscriptionModal.tsx
│   │       ├── SubscriptionPlanCard.tsx
│   │       ├── SubscribeFab.tsx
│   │       ├── SubscriptionStatusListener.tsx
│   │       ├── TieredDiscountInfo.tsx
│   │       ├── PaymentButtons.tsx
│   │       ├── PlanFeaturesList.tsx
│   │       └── useSubscriptionPayment.tsx
│   │
│   ├── academy/                # Academy
│   │   └── components/
│   │       ├── AcademyHeroCard.tsx
│   │       └── AcademyPurchaseModal.tsx
│   │
│   ├── payments/               # Payments
│   │   └── components/
│   │       ├── PaymentExchange.tsx
│   │       ├── PaymentExchangePage.tsx
│   │       ├── PaymentExchangeSuccess.tsx
│   │       ├── PaymentSuccessModal.tsx
│   │       ├── ExchangePaymentModal.tsx
│   │       ├── Bep20PaymentModal.tsx
│   │       ├── UsdtPaymentModal.tsx
│   │       ├── UsdtPaymentMethodModal.tsx
│   │       ├── IndicatorsPurchaseModal.tsx
│   │       ├── TradingPanelPurchaseModal.tsx
│   │       ├── PaymentHistoryItem.tsx
│   │       ├── DetailRow.tsx
│   │       ├── PaymentDetailsCard.tsx
│   │       └── SubscriptionDetailsCard.tsx
│   │
│   ├── notifications/          # Notifications
│   │   └── components/
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationToast.tsx
│   │       └── NotificationFilter.tsx
│   │
│   └── profile/                # Profile
│       └── components/
│           ├── ProfileHeader.tsx
│           ├── SubscriptionsSection.tsx
│           └── TelegramProfileLoader.tsx
│
├── shared/                     # Shared components
│   └── components/
│       ├── layout/            # Layout components
│       │   ├── Navbar.tsx
│       │   ├── FooterNav.tsx
│       │   ├── BackHeader.tsx
│       │   ├── Footer.tsx
│       │   ├── NavbarEnhanced.tsx
│       │   ├── FooterNavEnhanced.tsx
│       │   └── PageLayout.tsx
│       │
│       ├── common/            # Common components
│       │   ├── Loader.tsx
│       │   ├── SkeletonLoader.tsx
│       │   ├── SmartImage.tsx
│       │   ├── Spinner.tsx
│       │   ├── CustomSpinner.tsx
│       │   ├── SplashScreen.tsx
│       │   ├── InviteAlert.tsx
│       │   ├── ThemeToggle.tsx
│       │   ├── LoadingStates.tsx
│       │   ├── EmptyState.tsx
│       │   ├── EnhancedCard.tsx
│       │   └── Breadcrumbs.tsx
│       │
│       └── ErrorBoundary.tsx
│
├── core/                       # Core utilities
│   ├── api/
│   │   └── client.ts          # API client
│   └── utils/
│       └── logger.ts          # Logger
│
├── stores/                     # State management
│   └── zustand/
│       └── userStore.ts
│
├── pages/                      # Next.js pages
├── styles/                     # Global styles
└── types/                      # TypeScript types
```

---

## 💻 كيفية استخدام البنية

### 1. إضافة Feature جديد

```bash
# إنشاء مجلد feature
mkdir -p src/features/my-feature/components

# إضافة مكون
touch src/features/my-feature/components/MyComponent.tsx
```

```tsx
// src/features/my-feature/components/MyComponent.tsx
'use client'

import { Button } from '@/components/ui/button'
import logger from '@/core/utils/logger'

export default function MyComponent() {
  logger.info('MyComponent rendered')
  
  return (
    <div>
      <h1>My Feature</h1>
      <Button>Click me</Button>
    </div>
  )
}
```

### 2. استخدام المكون في صفحة

```tsx
// pages/my-page.tsx
import MyComponent from '@/features/my-feature/components/MyComponent'
import { PageLayout } from '@/shared/components/layout'

export default function MyPage() {
  return (
    <PageLayout>
      <MyComponent />
    </PageLayout>
  )
}
```

### 3. Imports المطلقة

```tsx
// ✅ استخدم مسارات مطلقة دائماً
import { Navbar } from '@/shared/components/layout/Navbar'
import { Loader } from '@/shared/components/common/Loader'
import logger from '@/core/utils/logger'
import api from '@/core/api/client'

// ❌ تجنب المسارات النسبية
import { Navbar } from '../../../shared/components/layout/Navbar'
```

---

## 📁 متى تضع الملف في أي مجلد؟

### features/
**متى:** مكون خاص بـ feature محدد

**أمثلة:**
- `SubscriptionModal` → `features/subscriptions/`
- `ProfileHeader` → `features/profile/`
- `PaymentModal` → `features/payments/`

### shared/components/layout/
**متى:** مكون layout يُستخدم في كل المشروع

**أمثلة:**
- `Navbar`
- `Footer`
- `PageLayout`

### shared/components/common/
**متى:** مكون عام قابل لإعادة الاستخدام

**أمثلة:**
- `Button` (إن لم يكن من shadcn)
- `Loader`
- `EmptyState`
- `Card`

### core/
**متى:** utilities أساسية تُستخدم في كل المشروع

**أمثلة:**
- `logger`
- `api client`
- `helpers`

---

## 🔧 Best Practices

### ✅ افعل:

```tsx
// 1. استخدم imports مطلقة
import { Component } from '@/features/auth/components/Component'

// 2. ضع كل feature في مجلده
features/auth/
├── components/
├── hooks/      (إن وُجد)
├── utils/      (إن وُجد)
└── types/      (إن وُجد)

// 3. أعد استخدام shared components
import { Loader } from '@/shared/components/common'

// 4. اتبع naming conventions
MyComponent.tsx  // PascalCase
myHook.ts        // camelCase
MY_CONSTANT.ts   // UPPER_SNAKE_CASE
```

### ❌ لا تفعل:

```tsx
// 1. لا تضع feature components في shared
// ❌ shared/components/SubscriptionModal.tsx

// 2. لا تستخدم مسارات نسبية
// ❌ import from '../../../components'

// 3. لا تخلط features
// ❌ features/auth/components/PaymentModal.tsx

// 4. لا تكرر الكود
// إذا كان مشتركاً، ضعه في shared
```

---

## 🚀 Migration من القديم للجديد

### الخطوة 1: نقل الملف
```bash
# من
src/components/SubscriptionModal.tsx

# إلى
src/features/subscriptions/components/SubscriptionModal.tsx
```

### الخطوة 2: تحديث Imports
```tsx
// القديم
import SubscriptionModal from '@/components/SubscriptionModal'

// الجديد
import SubscriptionModal from '@/features/subscriptions/components/SubscriptionModal'
```

### الخطوة 3: إنشاء Re-export (اختياري)
```tsx
// src/components/SubscriptionModal.tsx
export { default } from '@/features/subscriptions/components/SubscriptionModal'
export * from '@/features/subscriptions/components/SubscriptionModal'
```

---

## 📈 الفوائد المحققة

### قبل:
- ❌ 50+ component في مجلد واحد
- ❌ صعوبة إيجاد الملفات
- ❌ imports معقدة
- ❌ صعوبة الصيانة

### بعد:
- ✅ تنظيم feature-based واضح
- ✅ سهولة إيجاد الملفات
- ✅ imports بسيطة ومطلقة
- ✅ صيانة سهلة

---

## 📚 أمثلة عملية

### مثال 1: إنشاء Payments Feature
```
features/payments/
├── components/
│   ├── PaymentModal.tsx
│   ├── PaymentForm.tsx
│   └── PaymentHistory.tsx
├── hooks/
│   └── usePayment.ts
├── types/
│   └── payment.types.ts
└── index.ts  // Re-exports
```

### مثال 2: استخدام في صفحة
```tsx
// pages/payments.tsx
import { PageLayout } from '@/shared/components/layout'
import { PaymentModal, PaymentHistory } from '@/features/payments'
import { EmptyState } from '@/shared/components/common'

export default function PaymentsPage() {
  return (
    <PageLayout>
      <PaymentHistory />
      <PaymentModal />
    </PageLayout>
  )
}
```

---

## 🔍 نصائح للفريق

1. **اتفقوا على الهيكل** قبل البدء
2. **وثقوا القرارات** في README
3. **راجعوا PRs** للحفاظ على الهيكل
4. **استخدموا ESLint** لفرض القواعد

---

## 📚 المراجع

- **الكود:** `src/features/`, `src/shared/`, `src/core/`
- **التوثيق:** `docs/IMPROVEMENTS_IMPLEMENTED.md`
- **Migration Guide:** `docs/archive/COMPLETE_REFACTORING_PLAN.md`

---

**الحالة:** ✅ **الهيكل جاهز ومطبق في كل المشروع**
