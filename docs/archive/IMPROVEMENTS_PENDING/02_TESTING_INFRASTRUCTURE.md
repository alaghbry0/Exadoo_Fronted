# 🧪 بنية الاختبارات (Testing Infrastructure)

> **الأولوية:** 🔴 عالية  
> **الوقت المتوقع:** 2-3 أسابيع  
> **التأثير:** كبير على جودة الكود  
> **الحالة:** ⬜ لم يبدأ

---

## 📊 نظرة عامة

حالياً المشروع **لا يحتوي على أي اختبارات** (`"test": "echo \"No tests yet\" && exit 0"`).  
هذه المهمة تتطلب إعداد بنية اختبارات كاملة من الصفر.

---

## 🎯 الأهداف الرئيسية

- ⬜ إعداد Jest + React Testing Library
- ⬜ كتابة Unit Tests للمكونات الأساسية
- ⬜ إعداد E2E Testing (Playwright)
- ⬜ دمج الاختبارات في CI/CD

---

## 📦 المهام التفصيلية

### 1️⃣ إعداد Jest + React Testing Library

#### 📋 خطوات التثبيت

```bash
# تثبيت المكتبات الأساسية
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
npm install --save-dev @types/jest
```

#### ⚙️ إعداد jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### 📝 إنشاء jest.setup.js

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />
  },
}))
```

#### 🔧 تحديث package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### 2️⃣ Unit Tests للمكونات الأساسية

#### 📝 المكونات المستهدفة (أولوية عالية)

**Shared Components:**
- `Button` (من shadcn/ui)
- `Card`
- `CustomSpinner`
- `Loader`
- `SkeletonLoader`

**Layout Components:**
- `Navbar`
- `Footer`
- `PageLayout`

**Core Utilities:**
- Logger
- API Client
- Validation helpers

#### 💻 مثال: اختبار Button

```typescript
// src/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

#### 💻 مثال: اختبار CustomSpinner

```typescript
// src/components/CustomSpinner.test.tsx
import { render } from '@testing-library/react'
import CustomSpinner from './CustomSpinner'

describe('CustomSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<CustomSpinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has correct animation classes', () => {
    const { container } = render(<CustomSpinner />)
    const spinner = container.querySelector('[class*="animate"]')
    expect(spinner).toBeInTheDocument()
  })
})
```

---

### 3️⃣ Integration Tests

#### 📝 الـ Flows المستهدفة

**1. Authentication Flow:**
```typescript
// __tests__/flows/authentication.test.tsx
describe('Authentication Flow', () => {
  it('allows user to login via Telegram', async () => {
    // Test implementation
  })

  it('shows error on invalid credentials', async () => {
    // Test implementation
  })
})
```

**2. Subscription Purchase Flow:**
```typescript
describe('Subscription Flow', () => {
  it('completes subscription successfully', async () => {
    // 1. Navigate to shop
    // 2. Select plan
    // 3. Choose payment method
    // 4. Complete payment
    // 5. Verify success
  })
})
```

---

### 4️⃣ E2E Testing مع Playwright

#### 📋 خطوات الإعداد

```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### ⚙️ playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 💻 مثال: E2E Test

```typescript
// e2e/subscription.spec.ts
import { test, expect } from '@playwright/test'

test('user can purchase subscription', async ({ page }) => {
  await page.goto('/shop')
  
  // Click on a subscription plan
  await page.click('text=اشتراك شهري')
  
  // Select payment method
  await page.click('text=USDT')
  
  // Verify modal opened
  await expect(page.locator('[role="dialog"]')).toBeVisible()
  
  // Complete payment (mock)
  await page.click('text=تأكيد الدفع')
  
  // Verify success
  await expect(page.locator('text=تم الاشتراك بنجاح')).toBeVisible()
})
```

---

### 5️⃣ CI/CD Integration

#### 📝 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test -- --coverage
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📊 خطة التنفيذ

### الأسبوع 1:
- ⬜ إعداد Jest + RTL
- ⬜ كتابة اختبارات للمكونات الأساسية (10 مكونات)
- ⬜ إعداد CI/CD

### الأسبوع 2:
- ⬜ اختبارات Integration للـ Flows الرئيسية
- ⬜ إعداد Playwright
- ⬜ كتابة 5 E2E tests

### الأسبوع 3:
- ⬜ زيادة Test Coverage إلى >70%
- ⬜ توثيق الاختبارات
- ⬜ تدريب الفريق

---

## 🎯 النتيجة المتوقعة

- ✅ Test Coverage > 70%
- ✅ جميع المكونات الأساسية مختبرة
- ✅ CI/CD يمنع الأكواد المعطوبة
- ✅ ثقة أكبر عند التطوير

---

**آخر تحديث:** 23 أكتوبر 2025  
**الحالة:** ⬜ جاهز للبدء
