# 🎬 Framer Motion - Best Practices Guide

> **دليل شامل لاستخدام framer-motion بشكل صحيح في المشروع**  
> **الإصدار:** 1.0  
> **آخر تحديث:** 24 أكتوبر 2025

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [القواعد الأساسية](#القواعد-الأساسية)
3. [Animation Variants](#animation-variants)
4. [AnimatePresence](#animatepresence)
5. [Performance](#performance)
6. [أمثلة عملية](#أمثلة-عملية)
7. [أخطاء شائعة](#أخطاء-شائعة)
8. [Checklist](#checklist)

---

## 🎯 نظرة عامة

### **لماذا Framer Motion؟**

Framer Motion هي **أفضل مكتبة animations** لـ React:
- ✅ **Declarative** - تصريحية وسهلة القراءة
- ✅ **Performance** - محسّنة للأداء
- ✅ **Type-safe** - دعم كامل لـ TypeScript
- ✅ **Rich API** - features متقدمة (gestures, layout animations, etc.)

### **متى نستخدمها؟**

```tsx
✅ نعم - استخدمها في:
- Page transitions
- Modal/Dialog animations
- List animations (stagger)
- Hover/tap effects
- Conditional rendering animations
- Layout shifts

❌ لا - تجنبها في:
- Loaders بسيطة (استخدم CSS)
- Animations صغيرة جداً (1-2 properties)
- عناصر كثيرة جداً (> 50 عنصر في نفس الوقت)
```

---

## ⚡ القواعد الأساسية

### **القاعدة #1: استخدم Variants**

```tsx
// ❌ خطأ - Inline animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  محتوى
</motion.div>

// ✅ صحيح - Variants (قابلة لإعادة الاستخدام)
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.3 }}
>
  محتوى
</motion.div>
```

**لماذا؟**
- ✅ قابلة لإعادة الاستخدام
- ✅ سهلة الصيانة
- ✅ أداء أفضل (Framer Motion يحسّنها)
- ✅ دعم Stagger Children

---

### **القاعدة #2: استخدم AnimatePresence للعناصر المشروطة**

```tsx
// ❌ خطأ - بدون AnimatePresence
{isVisible && (
  <motion.div exit={{ opacity: 0 }}>
    محتوى
  </motion.div>
)}

// ✅ صحيح - مع AnimatePresence
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      محتوى
    </motion.div>
  )}
</AnimatePresence>
```

**لماذا؟**
- ✅ exit animations تعمل بشكل صحيح
- ✅ تحسين Performance
- ✅ تجنب memory leaks

---

### **القاعدة #3: تجنب Animations على خصائص ثقيلة**

```tsx
// ❌ خطأ - Animations على width/height (ثقيلة!)
<motion.div
  animate={{ width: '200px', height: '100px' }}
/>

// ✅ صحيح - استخدم transform properties
<motion.div
  animate={{ scaleX: 2, scaleY: 1.5 }}
/>

// ✅ أفضل - استخدم absolute positioning إذا لزم
<motion.div
  style={{ position: 'absolute' }}
  animate={{ width: '200px' }}
  transition={{ layout: { duration: 0.3 } }}
/>
```

**الخصائص الخفيفة (✅ استخدمها):**
- `opacity`
- `transform` (x, y, scale, rotate)
- `filter` (blur, brightness)

**الخصائص الثقيلة (❌ تجنبها):**
- `width`, `height`
- `top`, `left` (استخدم x, y بدلاً منها)
- `margin`, `padding`

---

## 🎨 Animation Variants

### **1. Fade In/Out**

```tsx
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  محتوى
</motion.div>
```

---

### **2. Slide In (من الجوانب)**

```tsx
// من اليمين (RTL)
const slideFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }
};

// من اليسار
const slideFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

// من الأسفل
const slideFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// من الأعلى
const slideFromTop = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
```

---

### **3. Scale In/Out**

```tsx
const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 30 
    }
  },
  exit: { scale: 0.8, opacity: 0 }
};

// استخدام شائع في Modals
<AnimatePresence>
  {isOpen && (
    <motion.div
      variants={scaleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```

---

### **4. Stagger Children (تأخير متتالي)**

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // تأخير 0.1 ثانية بين كل child
      delayChildren: 0.2    // تأخير قبل بدء animations
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// الاستخدام
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={itemVariants}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

### **5. Rotate & Flip**

```tsx
const rotateVariants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { 
    rotate: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const flipVariants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 }
};
```

---

## 🎭 AnimatePresence

### **استخدام أساسي**

```tsx
import { AnimatePresence, motion } from 'framer-motion';

function Component() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          محتوى
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### **مع Mode**

```tsx
// wait - انتظار exit animation قبل بدء الجديد
<AnimatePresence mode="wait">
  <motion.div key={currentPage}>
    {content}
  </motion.div>
</AnimatePresence>

// popLayout - للعناصر المتعددة
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

---

### **مع onExitComplete**

```tsx
<AnimatePresence
  onExitComplete={() => {
    console.log('Animation انتهت!');
    // يمكنك تنظيف state أو fetch data جديد
  }}
>
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## ⚡ Performance Best Practices

### **1. استخدم will-change**

```tsx
// للعناصر التي ستتحرك كثيراً
<motion.div
  style={{ willChange: 'transform' }}
  animate={{ x: 100 }}
/>
```

---

### **2. استخدم Layout Animations بحذر**

```tsx
// ❌ يمكن أن يكون ثقيلاً
<motion.div layout>
  محتوى ديناميكي
</motion.div>

// ✅ أفضل - محدد
<motion.div layoutId="unique-id">
  محتوى
</motion.div>
```

---

### **3. تجنب Animations كثيرة في نفس الوقت**

```tsx
// ❌ خطأ - 100 عنصر يتحرك في نفس الوقت!
{items.map(item => (
  <motion.div animate={{ x: 100 }}>
    {item}
  </motion.div>
))}

// ✅ صحيح - استخدم stagger
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div variants={itemVariants} key={item.id}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

### **4. استخدم useMemo للـ Variants الثقيلة**

```tsx
const variants = useMemo(() => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}), []); // لن يُعاد حسابها في كل render
```

---

## 💡 أمثلة عملية

### **مثال 1: Modal Animation**

```tsx
const Backdrop = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className="fixed inset-0 bg-black/50 z-50"
  />
);

const modalVariants = {
  hidden: { 
    opacity: 0,
    y: '-100%',
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0,
    y: '100%',
    scale: 0.8,
    transition: { duration: 0.2 }
  }
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClick={onClose} />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### **مثال 2: Page Transitions**

```tsx
const pageVariants = {
  initial: { 
    opacity: 0, 
    x: -100 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.3 }
  }
};

function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### **مثال 3: List Animation (Stagger)**

```tsx
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 35
    }
  }
};

function AnimatedList({ items }: { items: Item[] }) {
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={itemVariants}
          className="p-4 bg-white rounded-lg shadow"
        >
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

---

### **مثال 4: Hover Animation**

```tsx
const cardVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

function Card({ title, description }: CardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className="p-6 bg-white rounded-xl shadow-lg cursor-pointer"
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}
```

---

## ❌ أخطاء شائعة

### **خطأ #1: Inline Animations في كل مكان**

```tsx
// ❌ خطأ
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</motion.div>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</motion.div>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</motion.div>

// ✅ صحيح
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

<motion.div variants={fadeIn} initial="hidden" animate="visible">...</motion.div>
```

---

### **خطأ #2: عدم استخدام AnimatePresence**

```tsx
// ❌ خطأ - exit animation لن تعمل!
{isOpen && <motion.div exit={{ opacity: 0 }}>...</motion.div>}

// ✅ صحيح
<AnimatePresence>
  {isOpen && <motion.div exit={{ opacity: 0 }}>...</motion.div>}
</AnimatePresence>
```

---

### **خطأ #3: Animations على width/height**

```tsx
// ❌ خطأ - performance سيئ!
<motion.div animate={{ width: '200px', height: '100px' }} />

// ✅ صحيح - استخدم scale
<motion.div 
  animate={{ scaleX: 2, scaleY: 1.5 }}
  style={{ transformOrigin: 'right' }} // تحكم في نقطة البداية
/>
```

---

### **خطأ #4: نسيان key في AnimatePresence**

```tsx
// ❌ خطأ - AnimatePresence لن تعمل بشكل صحيح!
<AnimatePresence>
  {items.map(item => (
    <motion.div>...</motion.div> // ❌ لا يوجد key
  ))}
</AnimatePresence>

// ✅ صحيح
<AnimatePresence>
  {items.map(item => (
    <motion.div key={item.id}>...</motion.div> // ✅ key موجود
  ))}
</AnimatePresence>
```

---

## ✅ Checklist

### **قبل إضافة Animation:**
```markdown
□ هل Animation ضرورية؟ (تحسين UX؟)
□ هل يمكن استخدام CSS بدلاً منها؟ (أبسط وأخف)
□ هل الـ variants قابلة لإعادة الاستخدام؟
```

### **عند كتابة Animation:**
```markdown
□ استخدمت variants بدلاً من inline
□ استخدمت AnimatePresence للعناصر المشروطة
□ استخدمت transform properties (x, y, scale)
□ تجنبت width/height animations
□ أضفت key لكل motion element في list
```

### **Performance Check:**
```markdown
□ عدد العناصر المتحركة < 50
□ استخدمت will-change إذا لزم
□ استخدمت stagger بدلاً من animations متزامنة
□ اختبرت على أجهزة ضعيفة
```

---

## 📚 الموارد

### **الوثائق:**
- 📖 [Framer Motion Docs](https://www.framer.com/motion/)
- 🎨 [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - قسم Framer Motion

### **أدوات:**
```bash
npm run migration:scan  # يفحص framer-motion usage
```

---

## 🎯 الخلاصة

### **القواعد الذهبية:**

1. ✅ **استخدم Variants دائماً**
2. ✅ **AnimatePresence للعناصر المشروطة**
3. ✅ **transform properties فقط (x, y, scale, rotate)**
4. ✅ **will-change للعناصر الكثيرة**
5. ✅ **Stagger للـ lists**
6. ❌ **لا animations على width/height**
7. ❌ **لا أكثر من 50 عنصر متحرك**

---

**Created:** 24 أكتوبر 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0
