# 🎨 دليل مكونات UI الشامل

> **التحسين:** Enhanced UI/UX Components  
> **الحالة:** ⚠️ جاهز - لم يُطبق بعد  
> **المستوى:** مبتدئ - متوسط

---

## 📊 نظرة عامة

مجموعة من مكونات UI/UX محسّنة وجاهزة للاستخدام لتوحيد التجربة في كل المشروع.

---

## 📦 المكونات المتاحة

### 1. Layout Components

#### NavbarEnhanced
```tsx
import { NavbarEnhanced } from '@/shared/components/layout'

<NavbarEnhanced />
```

**الميزات:**
- ✅ دعم RTL طبيعي
- ✅ Mobile menu
- ✅ Notifications badge
- ✅ Sticky + blur

#### FooterNavEnhanced
```tsx
import { FooterNavEnhanced } from '@/shared/components/layout'

<FooterNavEnhanced />
```

**الميزات:**
- ✅ Active state animations
- ✅ usePathname داخلي
- ✅ Touch-friendly

#### PageLayout
```tsx
import { PageLayout } from '@/shared/components/layout'

<PageLayout maxWidth="xl" showNavbar showFooter>
  {children}
</PageLayout>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `showNavbar`: boolean (default: true)
- `showFooter`: boolean (default: true)
- `className`: string

---

### 2. Loading States

```tsx
import { 
  PageLoader,
  CardSkeleton,
  GridSkeleton,
  InlineLoader,
  TableSkeleton
} from '@/shared/components/common'
```

#### PageLoader
```tsx
if (isLoading) return <PageLoader />
```

#### GridSkeleton
```tsx
if (isLoading) return <GridSkeleton count={6} />
```

#### CardSkeleton
```tsx
if (isLoading) return <CardSkeleton />
```

---

### 3. EmptyState

```tsx
import { EmptyState } from '@/shared/components/common'
import { Inbox } from 'lucide-react'

<EmptyState
  icon={Inbox}
  title="لا توجد عناصر"
  description="ابدأ بإضافة عنصر جديد"
  action={{
    label: "إضافة عنصر",
    onClick: () => handleAdd()
  }}
/>
```

---

### 4. Enhanced Cards

```tsx
import { 
  EnhancedCard,
  ServiceCard,
  StatsCard
} from '@/shared/components/common'
```

#### ServiceCard
```tsx
<ServiceCard
  title="الإشارات"
  description="احصل على إشارات تداول دقيقة"
  icon={Zap}
  href="/shop/signals"
/>
```

#### StatsCard
```tsx
<StatsCard
  title="المستخدمون النشطون"
  value="1,234"
  icon={TrendingUp}
  trend={{ value: 12, isPositive: true }}
/>
```

---

### 5. Breadcrumbs

```tsx
import { Breadcrumbs } from '@/shared/components/common'

<Breadcrumbs items={[
  { label: 'الرئيسية', href: '/' },
  { label: 'الأكاديمية', href: '/academy' },
  { label: 'الدورة الحالية' }
]} />
```

---

## 💻 أمثلة كاملة

### مثال 1: صفحة بسيطة
```tsx
import { PageLayout } from '@/shared/components/layout'
import { PageLoader } from '@/shared/components/common'

export default function MyPage() {
  const { data, isLoading } = useQuery({...})
  
  if (isLoading) return (
    <PageLayout>
      <PageLoader />
    </PageLayout>
  )
  
  return (
    <PageLayout maxWidth="xl">
      <h1>محتوى الصفحة</h1>
    </PageLayout>
  )
}
```

### مثال 2: صفحة مع Empty State
```tsx
import { PageLayout } from '@/shared/components/layout'
import { PageLoader, EmptyState } from '@/shared/components/common'
import { Inbox } from 'lucide-react'

export default function MyPage() {
  const { data, isLoading } = useQuery({...})
  
  if (isLoading) return (
    <PageLayout>
      <PageLoader />
    </PageLayout>
  )
  
  if (!data?.length) return (
    <PageLayout>
      <EmptyState
        icon={Inbox}
        title="لا توجد بيانات"
        description="ابدأ بإضافة عناصر جديدة"
        action={{
          label: "إضافة عنصر",
          onClick: () => router.push('/add')
        }}
      />
    </PageLayout>
  )
  
  return (
    <PageLayout>
      {/* عرض البيانات */}
    </PageLayout>
  )
}
```

### مثال 3: Grid مع Cards
```tsx
import { PageLayout } from '@/shared/components/layout'
import { GridSkeleton, ServiceCard } from '@/shared/components/common'
import { Zap, Book, Award } from 'lucide-react'

const services = [
  { title: 'الإشارات', icon: Zap, href: '/signals' },
  { title: 'الأكاديمية', icon: Book, href: '/academy' },
  { title: 'الشهادات', icon: Award, href: '/certificates' },
]

export default function ServicesPage() {
  const { data, isLoading } = useQuery({...})
  
  if (isLoading) return (
    <PageLayout>
      <GridSkeleton count={6} />
    </PageLayout>
  )
  
  return (
    <PageLayout maxWidth="xl">
      <h1>خدماتنا</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.href} {...service} />
        ))}
      </div>
    </PageLayout>
  )
}
```

---

## 🎨 التخصيص

### تخصيص الألوان
```tsx
// في tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#...',
          // ...
          600: '#...',
        }
      }
    }
  }
}
```

### تخصيص المكونات
```tsx
// Extend existing component
import { EnhancedCard } from '@/shared/components/common'

export function MyCustomCard({ children, ...props }) {
  return (
    <EnhancedCard 
      className="my-custom-styles"
      {...props}
    >
      {children}
    </EnhancedCard>
  )
}
```

---

## ✅ Best Practices

### ✔️ افعل:
```tsx
// 1. استخدم PageLayout دائماً
<PageLayout maxWidth="xl">
  {/* content */}
</PageLayout>

// 2. استخدم Loading states الموحدة
if (isLoading) return <PageLoader />

// 3. استخدم EmptyState للحالات الفارغة
if (!data?.length) return <EmptyState {...} />

// 4. استخدم Enhanced Cards
<ServiceCard {...} />
```

### ❌ لا تفعل:
```tsx
// 1. لا تنشئ layout يدوياً
// ❌ 
<div>
  <Navbar />
  <main>{content}</main>
  <Footer />
</div>

// 2. لا تستخدم loading مختلفة
// ❌
<div>Loading...</div>
<Spinner />
<div className="loading">...</div>

// 3. لا تكرر Empty States
// ❌ كل صفحة لها empty state مخصص
```

---

## 🚀 خطة التطبيق

### المرحلة 1: صفحة تجريبية (يوم 1)
1. اختر صفحة واحدة (مثل `/profile`)
2. طبق PageLayout
3. اختبر شامل
4. تأكد من عمل كل شيء

### المرحلة 2: الصفحات الرئيسية (أسبوع 1)
1. `/` - الرئيسية
2. `/shop` - المتجر
3. `/academy` - الأكاديمية
4. `/profile` - الملف الشخصي

### المرحلة 3: باقي الصفحات (أسبوع 2)
1. طبق على جميع الصفحات المتبقية
2. استبدل Loading states
3. استبدل Empty states
4. استبدل Cards

### المرحلة 4: التنظيف (أيام)
1. احذف المكونات القديمة
2. احذف الكود المكرر
3. اختبار شامل نهائي

---

## 📚 المراجع

- **الكود:** `src/shared/components/`
- **التوثيق الكامل:** `docs/archive/UI_UX_COMPONENTS_REPORT.md`
- **الحالة:** `docs/IMPROVEMENTS_PARTIAL.md`

---

**الحالة:** ⚠️ **جاهز للتطبيق - يحتاج تنفيذ**
