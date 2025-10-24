# 🏗️ دليل البنية المعمارية (Architecture Guide)

> **دليل عملي لتنظيم الملفات والمجلدات في المشروع**  
> **آخر تحديث:** 24 أكتوبر 2025

---

## ⚡ القاعدة الأساسية: Feature-Based Architecture

### لماذا Feature-Based؟
**الفكرة:** كل ميزة (feature) في مجلد خاص بها مع كل ما تحتاجه

```
✅ سهولة الإيجاد
✅ عزل أفضل
✅ عمل فريق موازي
✅ صيانة أسهل
```

---

## 📁 الهيكل الأساسي

```
src/
├── features/          # Features محددة
│   ├── auth/         # التسجيل والدخول
│   ├── subscriptions/ # الاشتراكات
│   ├── academy/      # الأكاديمية
│   ├── payments/     # المدفوعات
│   └── ...
│
├── shared/           # مكونات مشتركة
│   ├── components/
│   │   ├── layout/   # Navbar, Footer, etc.
│   │   └── common/   # Button, Card, etc.
│   └── hooks/        # Custom hooks
│
├── core/             # Utilities أساسية
│   ├── api/         # API clients
│   ├── utils/       # Helper functions
│   └── config/      # Configuration
│
├── styles/          # Design system
│   ├── tokens/      # Design tokens
│   └── globals.css
│
└── pages/           # Next.js pages (routing فقط)
    └── ...
```

---

## 🎯 تنظيم Feature

**كل feature يحتوي:**

```
features/auth/
├── components/           # مكونات خاصة بالـ feature
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthModal.tsx
│
├── hooks/               # Hooks خاصة
│   └── useAuth.ts
│
├── utils/               # Functions خاصة
│   └── validation.ts
│
└── types.ts            # Types خاصة
```

---

## 📏 القواعد

### 1. الملف < 300 سطر
```tsx
// ❌ ملف واحد 500 سطر
features/shop/components/ShopPage.tsx (all-in-one)

// ✅ تقسيم منطقي
features/shop/
├── components/
│   ├── ShopPage.tsx      (150 سطر - layout)
│   ├── ShopHero.tsx      (100 سطر)
│   ├── ShopGrid.tsx      (150 سطر)
│   └── ShopFilters.tsx   (100 سطر)
```

### 2. استخدم index.ts للـ exports
```tsx
// features/auth/components/index.ts
export { LoginForm } from './LoginForm';
export { SignupForm } from './SignupForm';
export { AuthModal } from './AuthModal';

// الاستخدام
import { LoginForm, SignupForm } from '@/features/auth/components';
```

### 3. shared vs features
```tsx
// ✅ shared - يستخدم في أكثر من feature
shared/components/common/Button.tsx

// ✅ features - خاص بـ feature واحدة
features/auth/components/LoginForm.tsx
```

---

## 🔗 Import Paths

**استخدم aliases محددة:**

```tsx
// ✅ واضح ومنظم
import { Button } from '@/shared/components/common';
import { LoginForm } from '@/features/auth/components';
import { colors } from '@/styles/tokens';
import { api } from '@/core/api';

// ❌ تجنب relative paths الطويلة
import { Button } from '../../../shared/components/common/Button';
```

**المسارات المعرّفة (tsconfig.json):**
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/features/*": ["./src/features/*"],
    "@/shared/*": ["./src/shared/*"],
    "@/core/*": ["./src/core/*"],
    "@/styles/*": ["./src/styles/*"]
  }
}
```

---

## 📋 Checklist - إضافة Feature جديدة

- [ ] إنشاء مجلد في `features/`
- [ ] إنشاء `components/` folder
- [ ] إضافة `index.ts` للـ exports
- [ ] استخدام aliases للـ imports
- [ ] كل ملف < 300 سطر
- [ ] فحص بـ `npm run migration:scan`

---

## 🛠️ أمثلة عملية

### مثال 1: Feature بسيطة
```
features/notifications/
├── components/
│   ├── NotificationItem.tsx   (80 سطر)
│   ├── NotificationList.tsx   (120 سطر)
│   └── index.ts
├── hooks/
│   └── useNotifications.ts    (50 سطر)
└── types.ts                   (20 سطر)
```

### مثال 2: Feature معقدة
```
features/payments/
├── components/
│   ├── PaymentModal.tsx       (150 سطر)
│   ├── PaymentForm.tsx        (180 سطر)
│   ├── PaymentSuccess.tsx     (100 سطر)
│   ├── PaymentMethods.tsx     (120 سطر)
│   └── index.ts
├── hooks/
│   ├── usePayment.ts          (100 سطر)
│   └── usePaymentMethods.ts   (80 سطر)
├── utils/
│   ├── validation.ts          (60 سطر)
│   └── formatting.ts          (40 سطر)
└── types.ts                   (30 سطر)
```

---

## 🚀 نقل Feature من Component-Based

### الخطوات:
1. **تحديد ال feature**
   - مثال: كل ما يخص "Subscriptions"

2. **إنشاء المجلد**
   ```bash
   mkdir -p src/features/subscriptions/components
   ```

3. **نقل الملفات**
   ```bash
   # نقل من
   src/components/SubscriptionModal.tsx
   src/components/SubscriptionCard.tsx
   
   # إلى
   src/features/subscriptions/components/
   ```

4. **تحديث Imports**
   ```tsx
   // قبل
   import { SubscriptionModal } from '@/components/SubscriptionModal';
   
   // بعد
   import { SubscriptionModal } from '@/features/subscriptions/components';
   ```

5. **إنشاء index.ts**
   ```tsx
   // features/subscriptions/components/index.ts
   export { SubscriptionModal } from './SubscriptionModal';
   export { SubscriptionCard } from './SubscriptionCard';
   ```

---

**المراجع:**
- `DESIGN_SYSTEM.md` - القواعد الشاملة
- `docs/design/UX_ISSUES.md` - تحسينات UX
