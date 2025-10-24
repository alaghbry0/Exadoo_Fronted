# ♿ دليل إمكانية الوصول (Accessibility Guide)

> **دليل سريع لتطبيق معايير WCAG وأفضل ممارسات A11y**  
> **آخر تحديث:** 24 أكتوبر 2025

---

## ⚡ القواعد الذهبية

### 1. 🔘 كل زر بأيقونة فقط → aria-label
```tsx
// ❌ Screen reader لن يفهمه
<button onClick={handleDelete}>
  <Trash2 />
</button>

// ✅ واضح ومفهوم
<button onClick={handleDelete} aria-label="حذف العنصر">
  <Trash2 aria-hidden="true" />
</button>
```

### 2. 📝 كل input → label
```tsx
// ❌ بدون label
<input type="text" placeholder="الاسم" />

// ✅ مع label (الطريقة الأولى)
<label htmlFor="name">الاسم</label>
<input id="name" type="text" />

// ✅ مع label (الطريقة الثانية)
<label>
  الاسم
  <input type="text" />
</label>
```

### 3. 🖼️ كل صورة → alt text
```tsx
// ❌ بدون alt
<img src="/logo.png" />

// ✅ مع alt
<img src="/logo.png" alt="شعار الشركة" />

// ✅ للصور الديكورية
<img src="/decoration.png" alt="" aria-hidden="true" />
```

### 4. 🪟 كل modal → Focus trap + Escape
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const Modal = ({ isOpen, onClose }) => {
  const trapRef = useFocusTrap(isOpen);
  
  useKeyboardNavigation({
    onEscape: onClose,
    isActive: isOpen
  });
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <button onClick={onClose} aria-label="إغلاق">
        <X aria-hidden="true" />
      </button>
      {/* المحتوى */}
    </div>
  );
};
```

---

## 🎯 semantic HTML

### استخدم العناصر الصحيحة
```tsx
// ❌ div كزر
<div onClick={handleClick}>انقر</div>

// ✅ button
<button onClick={handleClick}>انقر</button>

// ❌ div للعناوين
<div className="text-2xl font-bold">عنوان</div>

// ✅ heading tags
<h2>عنوان</h2>

// ❌ div للروابط
<div onClick={() => router.push('/about')}>عنّا</div>

// ✅ link
<Link href="/about">عنّا</Link>
```

---

## ⌨️ Keyboard Navigation

### كل عنصر تفاعلي يجب أن يعمل بالكيبورد
```tsx
// ✅ Buttons تعمل تلقائياً
<button onClick={handleClick}>زر</button>

// ✅ Links تعمل تلقائياً
<Link href="/page">رابط</Link>

// ✅ Custom elements - أضف keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  عنصر مخصص
</div>
```

---

## 🎨 Contrast & Colors

### WCAG AA: Contrast ratio > 4.5:1
```tsx
// ✅ استخدم Design Tokens (محسّنة لـ WCAG)
import { colors } from '@/styles/tokens';

<div style={{ 
  color: colors.text.primary,      // Contrast: 15.3:1 ✅
  background: colors.bg.primary 
}}>

// ❌ تجنب ألوان ضعيفة
<div className="text-gray-400 bg-white">  // Contrast: 2.8:1 ❌
```

---

## 📋 Checklist - قبل Commit

### الأساسيات
- [ ] كل زر بأيقونة له `aria-label`
- [ ] كل input له `label`
- [ ] كل صورة لها `alt`
- [ ] semantic HTML صحيح

### Keyboard
- [ ] Tab navigation يعمل
- [ ] Enter/Space على الأزرار
- [ ] Escape يغلق Modals
- [ ] Arrows للقوائم

### ARIA
- [ ] `role` للعناصر المخصصة
- [ ] `aria-hidden="true"` للأيقونات
- [ ] `aria-modal="true"` للـ modals
- [ ] `aria-label` للأزرار بأيقونات

### Colors
- [ ] Contrast ratio > 4.5:1
- [ ] اختبار في Dark Mode
- [ ] استخدام Design Tokens

---

## 🛠️ Custom Hooks

### useFocusTrap
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

const Modal = ({ isOpen }) => {
  const trapRef = useFocusTrap(isOpen);
  return <div ref={trapRef}>...</div>;
};
```

### useKeyboardNavigation
```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

useKeyboardNavigation({
  onEscape: () => console.log('Escape'),
  onEnter: () => console.log('Enter'),
  onArrowDown: () => console.log('Down'),
  isActive: true
});
```

---

## ❌ الأخطاء الشائعة

### 1. أيقونة بدون aria-hidden
```tsx
// ❌ Screen reader سيقرأ الأيقونة والـ label
<button aria-label="حذف">
  <Trash2 />
</button>

// ✅ إخفاء الأيقونة عن Screen readers
<button aria-label="حذف">
  <Trash2 aria-hidden="true" />
</button>
```

### 2. div بدل button
```tsx
// ❌ لا keyboard، لا screen reader
<div onClick={handleClick}>انقر</div>

// ✅ button أو إضافة role + keyboard
<button onClick={handleClick}>انقر</button>
```

### 3. placeholder بدل label
```tsx
// ❌ placeholder يختفي عند الكتابة
<input type="text" placeholder="الاسم" />

// ✅ label دائم
<label htmlFor="name">الاسم</label>
<input id="name" type="text" placeholder="أدخل اسمك" />
```

---

## 🧪 الاختبار

```bash
# 1. اختبر بالكيبورد فقط
# - Tab للتنقل
# - Enter/Space للنقر
# - Escape للإغلاق

# 2. اختبر مع Screen reader
# - NVDA (Windows)
# - VoiceOver (Mac)
# - TalkBack (Android)

# 3. اختبر Contrast
# - استخدم Chrome DevTools
# - Lighthouse Accessibility audit
```

---

**المراجع:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- `DESIGN_SYSTEM.md` - Design Tokens (WCAG compliant)
- `docs/design/UI_ISSUES.md` - تحسينات UI
