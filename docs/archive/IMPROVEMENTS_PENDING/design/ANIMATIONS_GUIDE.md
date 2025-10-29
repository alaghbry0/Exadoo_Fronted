# 🎬 دليل Animations - مرجع سريع

> **النطاق:** كيفية استخدام Framer Motion بشكل صحيح  
> **الحجم:** 100-150 سطر

---

## 🎯 القاعدة الذهبية

**❌ لا تستخدم inline animations**  
**✅ استخدم reusable variants**

---

## ✅ الطريقة الصحيحة

### 1. إنشاء Animation Variants (مرة واحدة)

```tsx
// src/styles/animations.ts
export const animations = {
  // Page transitions
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  // Card animations
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  // Modal animations
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 }
  },
  
  // List animations (Stagger)
  stagger: {
    container: {
      animate: {
        transition: { staggerChildren: 0.1 }
      }
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 }
    }
  }
};
```

### 2. استخدامها في المكونات

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { animations } from '@/styles/animations';

// صفحة
export default function Page() {
  return (
    <motion.div {...animations.fadeIn}>
      {content}
    </motion.div>
  );
}

// بطاقة
function Card() {
  return (
    <motion.div {...animations.slideUp}>
      {content}
    </motion.div>
  );
}

// Modal
function Modal({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div {...animations.scaleIn}>
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// قائمة (List with stagger)
function List({ items }) {
  return (
    <motion.div 
      variants={animations.stagger.container}
      initial="initial"
      animate="animate"
    >
      {items.map(item => (
        <motion.div 
          key={item.id}
          variants={animations.stagger.item}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 🚫 الأخطاء الشائعة

### خطأ 1: Inline Animations
```tsx
// ❌ خطأ - inline animation
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// ✅ صحيح - reusable variant
import { animations } from '@/styles/animations';
<motion.div {...animations.slideUp}>
```

### خطأ 2: عدم استخدام AnimatePresence
```tsx
// ❌ خطأ - عنصر مشروط بدون AnimatePresence
{isVisible && <motion.div {...animations.fadeIn}>...</motion.div>}

// ✅ صحيح - مع AnimatePresence
<AnimatePresence>
  {isVisible && <motion.div {...animations.fadeIn}>...</motion.div>}
</AnimatePresence>
```

### خطأ 3: Heavy Animations
```tsx
// ❌ خطأ - animate على width/height (ثقيل)
<motion.div animate={{ width: '200px', height: '100px' }} />

// ✅ صحيح - استخدم transform (خفيف)
<motion.div animate={{ scale: 1.2 }} />
<motion.div animate={{ scaleX: 1.5 }} />
```

---

## ⚡ قواعد Performance

### 1. استخدم will-change
```tsx
<motion.div 
  style={{ willChange: 'transform' }}
  animate={{ x: 100 }}
>
```

### 2. تجنب Animations الثقيلة
```tsx
// ✅ خفيفة (GPU-accelerated)
transform, opacity, scale, rotate, translateX/Y

// ❌ ثقيلة (CPU-intensive)
width, height, top, left, padding, margin
```

### 3. Layout Animations بحذر
```tsx
// استخدم فقط عند الضرورة
<motion.div layout>
  محتوى ديناميكي
</motion.div>
```

---

## 📖 الأنماط الموصى بها

### 1. Fade In/Out
```tsx
fadeIn: {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}
```

### 2. Slide In
```tsx
slideUp: {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 }
}

slideRight: {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 }
}
```

### 3. Scale In
```tsx
scaleIn: {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 }
}
```

### 4. Stagger Children
```tsx
container: {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
},
item: {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
}
```

---

## ✅ Checklist

قبل Commit:
- [ ] لا توجد inline animations
- [ ] كل العناصر المشروطة في <AnimatePresence>
- [ ] لا animations ثقيلة (width/height)
- [ ] استخدمت animations من `@/styles/animations`
- [ ] `npm run migration:scan` ✅

---

**للمزيد:** `docs/FRAMER_MOTION_BEST_PRACTICES.md`
