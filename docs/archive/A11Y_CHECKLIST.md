# ✅ Accessibility Checklist

> دليل سريع للتحقق من Accessibility قبل كل Pull Request

---

## 🎯 Checklist سريع (5 دقائق)

### ✅ **قبل كل Commit:**

- [ ] جميع الأزرار بأيقونات لها `aria-label`
- [ ] جميع الـ inputs لها `<label>` مرتبطة
- [ ] جميع الصور لها `alt` text
- [ ] جميع الـ Modals تستخدم `useFocusTrap`
- [ ] جميع الأيقونات الديكورية لها `aria-hidden="true"`
- [ ] الألوان تحقق WCAG AA (تباين 4.5:1)

---

## 📋 Checklist مفصل

### 1️⃣ **Semantic HTML**

```tsx
✅ استخدم:
<main>      // للمحتوى الرئيسي
<nav>       // للتنقل
<header>    // للـ header
<footer>    // للـ footer
<section>   // للأقسام
<article>   // للمقالات
<aside>     // للمحتوى الجانبي

❌ تجنب:
<div>       // للكل (استخدمه فقط للتنسيق)
```

### 2️⃣ **ARIA Labels**

```tsx
✅ أضف aria-label للعناصر المهمة:
<section aria-label="القسم الرئيسي">
<nav aria-label="التنقل الرئيسي">
<button aria-label="إغلاق النافذة">
<input aria-label="البحث">

✅ أضف aria-hidden للأيقونات:
<Icon aria-hidden="true" />
```

### 3️⃣ **Form Inputs**

```tsx
✅ الطريقة الصحيحة:
<label htmlFor="email">البريد الإلكتروني</label>
<input id="email" type="email" />

// أو
<label>
  البريد الإلكتروني
  <input type="email" />
</label>

❌ خطأ:
<input type="email" placeholder="البريد" />
```

### 4️⃣ **Buttons**

```tsx
✅ أزرار بنص:
<button>حفظ</button>

✅ أزرار بأيقونات:
<button aria-label="حذف العنصر">
  <Trash2 aria-hidden="true" />
</button>

❌ خطأ:
<button>
  <Trash2 />  // بدون aria-label
</button>
```

### 5️⃣ **Images**

```tsx
✅ صور محتوى:
<img src="/logo.png" alt="شعار إكسادوا" />

✅ صور ديكورية:
<img src="/bg.png" alt="" aria-hidden="true" />

❌ خطأ:
<img src="/logo.png" />  // بدون alt
```

### 6️⃣ **Modals**

```tsx
✅ الطريقة الصحيحة:
import { useFocusTrap } from '@/hooks/useFocusTrap';

const Modal = ({ isOpen, onClose }) => {
  const trapRef = useFocusTrap(isOpen);
  
  return (
    <div 
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">عنوان المودال</h2>
      {/* المحتوى */}
    </div>
  );
};
```

### 7️⃣ **Keyboard Navigation**

```tsx
✅ استخدم useKeyboardNavigation:
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const Component = () => {
  useKeyboardNavigation({
    onEscape: () => closeModal(),
    onEnter: () => submitForm(),
  });
};
```

### 8️⃣ **Color Contrast**

```
✅ تحقق من التباين:
- WCAG AA: 4.5:1 (للنص العادي)
- WCAG AAA: 7:1 (للنص الكبير)

أداة الفحص:
https://webaim.org/resources/contrastchecker/
```

### 9️⃣ **Headings**

```tsx
✅ ترتيب صحيح:
<h1>العنوان الرئيسي</h1>
  <h2>عنوان فرعي</h2>
    <h3>عنوان فرعي فرعي</h3>

❌ خطأ:
<h1>العنوان</h1>
<h3>عنوان فرعي</h3>  // تخطي h2
```

### 🔟 **Links**

```tsx
✅ روابط واضحة:
<a href="/shop">اذهب إلى المتجر</a>

✅ روابط بأيقونات:
<a href="/shop" aria-label="اذهب إلى المتجر">
  <ShoppingCart aria-hidden="true" />
</a>

❌ خطأ:
<a href="/shop">اضغط هنا</a>  // غير واضح
```

---

## 🧪 اختبار سريع

### ✅ **قبل كل PR:**

1. **Keyboard Test:**
   - [ ] اضغط Tab - هل يمكنك الوصول لكل العناصر؟
   - [ ] اضغط Escape - هل تُغلق الـ Modals؟
   - [ ] اضغط Enter - هل تُفعّل الأزرار؟

2. **Screen Reader Test:**
   - [ ] هل جميع العناصر لها labels واضحة؟
   - [ ] هل الصور لها alt text؟
   - [ ] هل الـ headings منظمة؟

3. **Visual Test:**
   - [ ] هل Focus indicators واضحة؟
   - [ ] هل الألوان متباينة بشكل جيد؟
   - [ ] هل النص قابل للقراءة؟

---

## 🚨 أخطاء شائعة

### ❌ **1. نسيان aria-label للأيقونات**
```tsx
// خطأ
<button><X /></button>

// صحيح
<button aria-label="إغلاق">
  <X aria-hidden="true" />
</button>
```

### ❌ **2. استخدام div بدل button**
```tsx
// خطأ
<div onClick={handleClick}>انقر</div>

// صحيح
<button onClick={handleClick}>انقر</button>
```

### ❌ **3. نسيان alt للصور**
```tsx
// خطأ
<img src="/logo.png" />

// صحيح
<img src="/logo.png" alt="الشعار" />
```

### ❌ **4. عدم ربط label بـ input**
```tsx
// خطأ
<label>الاسم</label>
<input type="text" />

// صحيح
<label htmlFor="name">الاسم</label>
<input id="name" type="text" />
```

### ❌ **5. نسيان Focus Trap في Modals**
```tsx
// خطأ
<div role="dialog">...</div>

// صحيح
const trapRef = useFocusTrap(isOpen);
<div ref={trapRef} role="dialog">...</div>
```

---

## 🎯 Quick Reference

### **Custom Hooks المتاحة:**

```tsx
// Focus Trap
import { useFocusTrap } from '@/hooks/useFocusTrap';
const trapRef = useFocusTrap(isOpen);

// Keyboard Navigation
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
useKeyboardNavigation({ onEscape: close });

// ARIA Announcer
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer';
const { announce, message, priority } = useAriaAnnouncer();
```

### **Utility Classes:**

```tsx
// Screen Reader Only
<span className="sr-only">نص للـ Screen Readers فقط</span>

// Skip to Content (موجود بالفعل في _app.tsx)
<SkipToContent />
```

---

## 📚 موارد مفيدة

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## ✅ Checklist للـ PR

```markdown
## Accessibility Checklist

- [ ] جميع الأزرار بأيقونات لها aria-label
- [ ] جميع الـ inputs لها labels مرتبطة
- [ ] جميع الصور لها alt text
- [ ] جميع الـ Modals تستخدم useFocusTrap
- [ ] جميع الأيقونات الديكورية لها aria-hidden
- [ ] الألوان تحقق WCAG AA
- [ ] Keyboard navigation يعمل
- [ ] Focus indicators واضحة
- [ ] Headings منظمة (h1→h2→h3)
- [ ] Semantic HTML مستخدم
```

---

**تذكر:** Accessibility ليس ميزة إضافية، بل هو **حق أساسي** لجميع المستخدمين! ♿✨
