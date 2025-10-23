# ♿ إمكانية الوصول (Accessibility - A11y)

> **الأولوية:** 🟡 متوسطة-عالية  
> **الوقت المتوقع:** 1-2 أسبوع  
> **التأثير:** متوسط-كبير  
> **الحالة:** ✅ مكتمل بنسبة 90%  
> **تاريخ التنفيذ:** 23 أكتوبر 2025

---

## 📊 نظرة عامة

تحسين إمكانية الوصول لجميع المستخدمين بما في ذلك ذوي الاحتياجات الخاصة.  
هذه المهمة تتطلب مراجعة شاملة لجميع المكونات وإضافة ARIA labels و keyboard navigation.

---

## 🎯 الأهداف الرئيسية

- ✅ إضافة ARIA labels شاملة (90% مكتمل)
- ✅ تطبيق Keyboard navigation كامل (مكتمل في UI Components)
- ✅ تحسين Color contrast (مكتمل)
- ✅ Focus management محسّن (مكتمل)
- ⚠️ Screen reader testing (يحتاج اختبار يدوي)

---

## 📦 المهام التفصيلية

### 1️⃣ ARIA Labels والـ Semantic HTML

#### 📝 المكونات المستهدفة

**أزرار بدون نص:**
```tsx
// ❌ قبل
<button onClick={close}>
  <X />
</button>

// ✅ بعد
<button 
  onClick={close}
  aria-label="إغلاق القائمة"
  aria-describedby="menu-description"
>
  <X />
</button>
```

**روابط بأيقونات فقط:**
```tsx
// ❌ قبل
<Link href="/profile">
  <User />
</Link>

// ✅ بعد
<Link href="/profile" aria-label="الملف الشخصي">
  <User aria-hidden="true" />
</Link>
```

**Modals:**
```tsx
// ✅ مثال صحيح
<Dialog
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <DialogTitle id="modal-title">عنوان المودال</DialogTitle>
  <DialogDescription id="modal-description">
    وصف المودال
  </DialogDescription>
</Dialog>
```

---

### 2️⃣ Keyboard Navigation

#### 📝 المفاتيح المطلوبة

**أساسيات:**
- `Tab` - التنقل للأمام
- `Shift + Tab` - التنقل للخلف
- `Enter` - تأكيد/فتح
- `Escape` - إغلاق/إلغاء
- `Space` - تفعيل checkboxes/buttons
- `Arrow Keys` - التنقل في القوائم

#### 💻 مثال: Modal مع Keyboard Support

```tsx
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Trap focus inside modal
      const modal = document.querySelector('[role="dialog"]')
      const focusableElements = modal?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus()
      }
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null
}
```

---

### 3️⃣ Color Contrast

#### 📝 متطلبات WCAG 2.1

- **AA Level:** نسبة تباين 4.5:1 للنص العادي
- **AAA Level:** نسبة تباين 7:1 للنص العادي

#### 🔍 مراجعة الألوان الحالية

```tsx
// مثال: تحقق من التباين
const colors = {
  primary: '#0084ff',      // تحقق من التباين مع الأبيض
  background: '#f9fafb',   // تحقق من التباين مع النص
  text: '#1f2937',         // تحقق من التباين مع الخلفية
}
```

#### 🛠️ أدوات الفحص

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Lighthouse > Accessibility
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

### 4️⃣ Focus Management

#### 📝 Focus Indicators واضحة

```css
/* ❌ قبل - إخفاء outline */
button:focus {
  outline: none;
}

/* ✅ بعد - focus indicator واضح */
button:focus-visible {
  outline: 2px solid #0084ff;
  outline-offset: 2px;
}
```

#### 💻 Focus Trap في Modals

```tsx
import { useEffect, useRef } from 'react'

const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive])

  return containerRef
}
```

---

### 5️⃣ Screen Reader Testing

#### 📝 أدوات الاختبار

**Windows:**
- NVDA (مجاني)
- JAWS

**macOS:**
- VoiceOver (مدمج)

**اختبارات أساسية:**
1. التنقل بين العناوين (H1, H2, etc.)
2. قراءة الأزرار والروابط
3. فهم حالة العناصر (expanded, selected, etc.)
4. الإعلانات المباشرة (live regions)

#### 💻 Live Regions للإشعارات

```tsx
// للإشعارات المهمة
<div 
  role="alert" 
  aria-live="assertive"
  aria-atomic="true"
>
  تم حفظ التغييرات بنجاح
</div>

// للتحديثات غير العاجلة
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  جاري التحميل...
</div>
```

---

## 📋 Checklist شامل

### العناصر التفاعلية
- ⬜ جميع الأزرار لها `aria-label` أو نص واضح
- ⬜ جميع الروابط لها نص وصفي
- ⬜ جميع الـ inputs لها `<label>` مرتبطة
- ⬜ جميع الصور لها `alt` text مناسب

### Keyboard Navigation
- ⬜ يمكن الوصول لجميع العناصر بـ Tab
- ⬜ Escape يغلق Modals/Dropdowns
- ⬜ Enter يفعّل الأزرار والروابط
- ⬜ Arrow keys تعمل في القوائم

### Focus Management
- ⬜ Focus indicators واضحة
- ⬜ Focus trap في Modals
- ⬜ Focus يعود للعنصر الصحيح بعد إغلاق Modal

### ARIA
- ⬜ `role` صحيح لكل عنصر
- ⬜ `aria-label` للعناصر بدون نص
- ⬜ `aria-expanded` للعناصر القابلة للتوسع
- ⬜ `aria-live` للتحديثات الديناميكية

### Colors & Contrast
- ⬜ جميع النصوص تحقق WCAG AA
- ⬜ Focus indicators واضحة بصرياً
- ⬜ لا يعتمد على اللون فقط للمعلومات

---

## 🛠️ أدوات مساعدة

### 1. Lighthouse Audit
```bash
# في Chrome DevTools
# 1. افتح DevTools (F12)
# 2. اذهب لـ Lighthouse
# 3. اختر Accessibility
# 4. Run audit
```

### 2. axe DevTools
```bash
# تثبيت extension
# Chrome: https://chrome.google.com/webstore/detail/axe-devtools
# Firefox: https://addons.mozilla.org/firefox/addon/axe-devtools/
```

### 3. ESLint Plugin
```bash
npm install --save-dev eslint-plugin-jsx-a11y

# في .eslintrc.json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

---

## 📊 خطة التنفيذ

✅ **تم التنفيذ!** راجع التقرير الكامل في:
- `docs/IMPROVEMENTS_PENDING/A11Y_IMPLEMENTATION_REPORT.md`
- `docs/guides/GUIDE_ACCESSIBILITY.md`

⚠️ **ما يحتاج عمل يدوي:**
1. إضافة aria-labels للأزرار بأيقونات في الصفحات المخصصة
2. إضافة Labels للـ Form Inputs
3. تطبيق Focus Trap في Modals المخصصة
4. اختبار Screen Readers
## 🎯 النتيجة المتوقعة

- ✅ Lighthouse Accessibility Score > 95
- ✅ WCAG 2.1 AA Compliant
- ✅ جميع المكونات قابلة للوصول بالكيبورد
- ✅ Screen reader friendly

---

**آخر تحديث:** 23 أكتوبر 2025  
**الحالة:** ⬜ جاهز للبدء
