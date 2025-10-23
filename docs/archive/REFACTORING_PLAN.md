# 🔄 خطة إعادة الهيكلة - Exaado Frontend

## 📋 نظرة عامة

هذه الخطة توضح خطوات عملية لإعادة هيكلة المشروع بشكل تدريجي دون التأثير على الوظائف الحالية.

---

## 🎯 المرحلة 1: التحضيرات الأساسية (أسبوع 1)

### ✅ الخطوات المنفذة

- [x] إنشاء API Client موحد (`src/core/api/client.ts`)
- [x] إنشاء Logger utility (`src/core/utils/logger.ts`)
- [x] إنشاء Error Boundary (`src/shared/components/ErrorBoundary.tsx`)

### ⏳ الخطوات القادمة

#### 1. استبدال console.log بـ Logger

```bash
# البحث عن جميع console.log
npm run find-logs  # أضف هذا Script في package.json

# الاستبدال اليدوي أو الآلي
```

**ملف package.json:**
```json
{
  "scripts": {
    "find-logs": "grep -r 'console\\.log' src/ --exclude-dir=node_modules",
    "lint:logs": "eslint src/ --rule 'no-console: error'"
  }
}
```

**مثال على الاستبدال:**
```typescript
// ❌ قبل
console.log("User data loaded:", data)

// ✅ بعد
import logger from '@/core/utils/logger'
logger.info("User data loaded", data)
```

#### 2. إضافة Error Boundary في _app.tsx

```typescript
// src/pages/_app.tsx
import ErrorBoundary from '@/shared/components/ErrorBoundary'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <TonConnectUIProvider>
        <TelegramProvider>
          {/* باقي المكونات */}
        </TelegramProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  )
}
```

#### 3. توحيد State Management

**خطوات دمج profileStores:**

```typescript
// ❌ حذف src/stores/profileStore.ts (المكرر)

// ✅ الاحتفاظ بـ src/stores/profileStore/index.ts فقط
// ✅ دمج الوظائف من userStore.ts

// src/stores/profileStore/index.ts (النسخة الموحدة)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  // بيانات المستخدم من Telegram
  telegramId: string | null
  telegramUsername: string | null
  fullName: string | null
  photoUrl: string | null
  
  // حالة الربط
  isLinked: boolean
  gmail: string | null
  
  // الاشتراكات
  subscriptions: Subscription[]
  
  // Actions
  setUserData: (data: Partial<UserState>) => void
  setSubscriptions: (subs: Subscription[]) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      telegramId: null,
      telegramUsername: null,
      fullName: null,
      photoUrl: null,
      isLinked: false,
      gmail: null,
      subscriptions: [],
      
      // Actions
      setUserData: (data) => set((state) => ({ ...state, ...data })),
      setSubscriptions: (subs) => set({ subscriptions: subs }),
      clearUser: () => set({
        telegramId: null,
        telegramUsername: null,
        fullName: null,
        photoUrl: null,
        isLinked: false,
        gmail: null,
        subscriptions: [],
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        telegramId: state.telegramId,
        isLinked: state.isLinked,
        gmail: state.gmail,
      }),
    }
  )
)
```

---

## 🏗️ المرحلة 2: إعادة تنظيم المكونات (أسبوع 2-3)

### الاستراتيجية

**نقل المكونات تدريجياً** دون كسر الـ imports الموجودة:

#### الخطوة 1: إنشاء الهيكل الجديد

```bash
mkdir -p src/features/{auth,subscriptions,academy,payments,notifications,profile}/components
mkdir -p src/shared/components/{layout,common,feedback}
```

#### الخطوة 2: نقل المكونات مع الاحتفاظ بـ Re-exports

```typescript
// 1. نقل الملف
mv src/components/AuthFab.tsx src/features/auth/components/AuthFab.tsx

// 2. إنشاء re-export في المكان القديم (مؤقتاً)
// src/components/AuthFab.tsx
export { default } from '@/features/auth/components/AuthFab'
export * from '@/features/auth/components/AuthFab'
```

#### الخطوة 3: تحديث الـ imports تدريجياً

```typescript
// ❌ القديم
import AuthFab from '@/components/AuthFab'

// ✅ الجديد
import AuthFab from '@/features/auth/components/AuthFab'
```

### جدول النقل المقترح

| الأسبوع | المكونات المراد نقلها | الـ Feature |
|---------|----------------------|------------|
| 2.1 | AuthFab, GlobalAuthSheet, UnlinkedStateBanner | auth |
| 2.2 | SubscriptionModal, SubscriptionCard, PlanFeaturesList | subscriptions |
| 2.3 | AcademyHeroCard, CourseCard, CourseSidebar | academy |
| 2.4 | PaymentExchange, PaymentSuccessModal | payments |
| 3.1 | NotificationItem, NotificationToast | notifications |
| 3.2 | ProfileHeader, SubscriptionsSection | profile |
| 3.3 | Navbar, FooterNav, BackHeader | shared/layout |
| 3.4 | SmartImage, Loader, SkeletonLoader | shared/common |

---

## ⚡ المرحلة 3: تحسينات الأداء (أسبوع 4-5)

### 1. استبدال fetch بـ API Client

**مثال:**

```typescript
// ❌ قبل (src/services/api.ts)
export const getSubscriptionPlans = async (telegramId: string | null) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-plans`)
  if (telegramId) {
    url.searchParams.append('telegram_id', telegramId)
  }
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error('Failed to fetch')
  return await response.json()
}

// ✅ بعد
import api from '@/core/api/client'

export const getSubscriptionPlans = async (telegramId?: string) => {
  return api.get('/api/public/subscription-plans', {
    params: telegramId ? { telegram_id: telegramId } : undefined,
  })
}
```

### 2. تطبيق Code Splitting

```typescript
// src/pages/shop/index.tsx
import dynamic from 'next/dynamic'

// ✅ المكونات الثقيلة فقط
const AcademyHeroCard = dynamic(
  () => import('@/features/academy/components/AcademyHeroCard'),
  { loading: () => <CardSkeleton /> }
)

const SubscriptionModal = dynamic(
  () => import('@/features/subscriptions/components/SubscriptionModal'),
  { ssr: false }
)
```

### 3. تحسين الصور

```typescript
// next.config.ts
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // سنة
  },
}
```

---

## 🧪 المرحلة 4: الاختبارات (أسبوع 6-7)

### Setup Testing Environment

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install -D @testing-library/user-event msw
```

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
}
```

### كتابة Tests للمكونات الحرجة

**الأولوية:**
1. ✅ Auth components
2. ✅ Payment flow
3. ✅ Subscription modal
4. ✅ API client
5. ✅ Stores

---

## 📊 المرحلة 5: المراقبة والقياس (أسبوع 8)

### 1. إضافة Performance Monitoring

```typescript
// src/core/utils/performance.ts
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    
    logger.performance('Page Load', pageLoadTime)
    
    // إرسال إلى Analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'load',
        value: pageLoadTime,
      })
    }
  })
}
```

### 2. Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli@0.12.x autorun
```

---

## ✅ Checklist التنفيذ

### أسبوع 1: البنية التحتية
- [x] إنشاء API Client
- [x] إنشاء Logger
- [x] إنشاء Error Boundary
- [ ] استبدال console.log
- [ ] إضافة Error Boundary في _app
- [ ] توحيد Stores

### أسبوع 2-3: إعادة الهيكلة
- [ ] إنشاء feature folders
- [ ] نقل auth components
- [ ] نقل subscription components
- [ ] نقل academy components
- [ ] نقل payment components
- [ ] نقل shared components

### أسبوع 4-5: التحسينات
- [ ] استبدال fetch بـ API client
- [ ] تطبيق Code Splitting
- [ ] تحسين الصور
- [ ] تطبيق Memoization
- [ ] تحسين React Query config

### أسبوع 6-7: الاختبارات
- [ ] Setup testing environment
- [ ] كتابة unit tests
- [ ] كتابة integration tests
- [ ] Setup MSW للـ API mocking

### أسبوع 8: القياس والتوثيق
- [ ] إضافة Performance monitoring
- [ ] Setup Lighthouse CI
- [ ] كتابة documentation
- [ ] Code review نهائي

---

## 📝 ملاحظات مهمة

### ⚠️ احتياطات

1. **لا تحذف الملفات القديمة فوراً** - استخدم re-exports أولاً
2. **اختبر بعد كل تغيير** - تأكد أن كل شيء يعمل
3. **استخدم Git بشكل مكثف** - commit صغير بعد كل خطوة
4. **احتفظ بنسخة احتياطية** - قبل البدء في التغييرات الكبيرة

### 🎯 معايير النجاح

- ✅ جميع الوظائف تعمل كما هي
- ✅ تحسن الأداء بنسبة 30%+
- ✅ Bundle size أقل بنسبة 25%+
- ✅ Code coverage > 70%
- ✅ Lighthouse score > 90

---

**آخر تحديث:** أكتوبر 2025  
**المسؤول:** فريق Exaado Development
