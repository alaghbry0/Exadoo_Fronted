# ♿ دليل Accessibility للمطورين

> دليل سريع لتطبيق معايير إمكانية الوصول في المشروع

---

## 🎯 القواعد الأساسية

### 1. **كل زر بأيقونة فقط يحتاج aria-label**

```tsx
// ❌ خطأ
<button onClick={handleDelete}>
  <Trash2 />
</button>

// ✅ صحيح
<button onClick={handleDelete} aria-label="حذف العنصر">
  <Trash2 aria-hidden="true" />
</button>
```

### 2. **كل input يحتاج label**

```tsx
// ❌ خطأ
<input type="text" placeholder="الاسم" />

// ✅ صحيح - الطريقة الأولى
<label htmlFor="name">الاسم</label>
<input id="name" type="text" />

// ✅ صحيح - الطريقة الثانية
<label>
  الاسم
  <input type="text" />
</label>
```

### 3. **كل modal يحتاج Focus Trap**

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

const MyModal = ({ isOpen, onClose }) => {
  const trapRef = useFocusTrap(isOpen);
  
  useKeyboardNavigation({
    onEscape: onClose,
    isActive: isOpen
  });
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      {/* المحتوى */}
    </div>
  );
};
```

### 4. **كل صورة تحتاج alt text**

```tsx
// ❌ خطأ
<img src="/logo.png" />

// ✅ صحيح
<img src="/logo.png" alt="شعار إكسادوا" />

// ✅ للصور الديكورية
<img src="/decoration.png" alt="" aria-hidden="true" />
```

---

## 🛠️ Custom Hooks المتاحة

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

const Component = () => {
  useKeyboardNavigation({
    onEscape: () => console.log('Escape pressed'),
    onEnter: () => console.log('Enter pressed'),
    onArrowDown: () => console.log('Arrow Down'),
  });
};
```

### useAriaAnnouncer
```tsx
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer';

const Component = () => {
  const { announce, message, priority } = useAriaAnnouncer();
  
  const handleSave = () => {
    announce('تم الحفظ بنجاح', 'polite');
  };
  
  return (
    <>
      <button onClick={handleSave}>حفظ</button>
      <div 
        role={priority === 'assertive' ? 'alert' : 'status'}
        aria-live={priority}
        className="sr-only"
      >
        {message}
      </div>
    </>
  );
};
```

---

## 🎨 Utility Classes

### Screen Reader Only
```tsx
// مخفي بصرياً لكن متاح للـ Screen Readers
<span className="sr-only">نص للـ Screen Readers فقط</span>
```

### Skip to Content
```tsx
// موجود بالفعل في _app.tsx
<SkipToContent />
```

---

## ✅ Checklist سريع

قبل كل Pull Request، تأكد من:

- [ ] جميع الأزرار بأيقونات لها `aria-label`
- [ ] جميع الـ inputs لها `<label>` مرتبطة
- [ ] جميع الصور لها `alt` text
- [ ] جميع الـ Modals تستخدم `useFocusTrap`
- [ ] جميع الأيقونات الديكورية لها `aria-hidden="true"`
- [ ] Focus indicators واضحة ومرئية
- [ ] الألوان تحقق WCAG AA (تباين 4.5:1)

---

## 🧪 كيفية الاختبار

### 1. Keyboard Navigation
```
Tab       - التنقل للأمام
Shift+Tab - التنقل للخلف
Enter     - تفعيل
Escape    - إغلاق
```

### 2. Screen Reader
```bash
# Windows - NVDA (مجاني)
https://www.nvaccess.org/download/

# macOS - VoiceOver (مدمج)
Command + F5
```

### 3. Lighthouse
```
1. افتح Chrome DevTools (F12)
2. اذهب لـ Lighthouse
3. اختر Accessibility
4. Run audit
```

---

## 🚨 أخطاء شائعة

### ❌ نسيان aria-hidden للأيقونات
```tsx
// خطأ
<button aria-label="حذف">
  <Trash2 />  {/* Screen Reader سيقرأ الأيقونة أيضاً */}
</button>

// صحيح
<button aria-label="حذف">
  <Trash2 aria-hidden="true" />
</button>
```

### ❌ استخدام div بدل button
```tsx
// خطأ - لا يمكن الوصول إليه بالكيبورد
<div onClick={handleClick}>انقر</div>

// صحيح
<button onClick={handleClick}>انقر</button>
```

### ❌ نسيان role للعناصر المخصصة
```tsx
// خطأ
<div onClick={handleClick}>زر مخصص</div>

// صحيح
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  زر مخصص
</div>

// أفضل - استخدم button
<button onClick={handleClick}>زر مخصص</button>
```

---

## 📚 موارد إضافية

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**تذكر:** Accessibility ليس ميزة إضافية، بل هو **حق أساسي** لجميع المستخدمين! 🌟
