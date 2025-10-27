# 🚀 البداية السريعة - نظام تحميل الصور

> **ابدأ باستخدام SmartImage المحسّن في 5 دقائق!**

---

## ⚡ التثبيت

المكونات جاهزة ومثبتة! فقط تأكد من:

```bash
# تأكد من تثبيت lucide-react
npm install lucide-react

# أو
yarn add lucide-react
```

---

## 📝 الاستخدام الأساسي

### 1. صورة بسيطة مع Lazy Loading

```tsx
import SmartImage from '@/components/SmartImage';

function MyComponent() {
  return (
    <div className="w-64 h-64">
      <SmartImage 
        src="/my-image.jpg"
        alt="وصف الصورة"
        lazy={true}
        fill
      />
    </div>
  );
}
```

**النتيجة:** صورة تُحمّل فقط عند ظهورها، مع skeleton loader جميل!

---

### 2. Hero Image (بدون lazy)

```tsx
import SmartImage from '@/components/SmartImage';

function Hero() {
  return (
    <div className="w-full h-[500px]">
      <SmartImage 
        src="/hero.jpg"
        alt="صورة رئيسية"
        eager={true}
        noFade={true}
        fill
      />
    </div>
  );
}
```

**النتيجة:** تحميل فوري بدون تأخير للصور الحرجة!

---

### 3. صورة مع Spinner

```tsx
import SmartImage from '@/components/SmartImage';

function ProductImage() {
  return (
    <div className="w-full aspect-square">
      <SmartImage 
        src="/product.jpg"
        alt="منتج"
        lazy={true}
        loaderType="spinner"
        fill
      />
    </div>
  );
}
```

**النتيجة:** spinner دائري أنيق أثناء التحميل!

---

### 4. صورة مع Blur ملون (ميزة متقدمة)

```tsx
import SmartImage from '@/shared/components/common/SmartImage';

function FancyImage() {
  return (
    <div className="w-full h-64">
      <SmartImage 
        src="/image.jpg"
        alt="صورة"
        lazy={true}
        blurType="primary"
        autoQuality={true}
        width={800}
        height={600}
      />
    </div>
  );
}
```

**النتيجة:** blur placeholder أزرق + جودة محسّنة تلقائياً!

---

## 🎨 خيارات Loader

| Loader | الاستخدام المثالي | الشكل |
|--------|------------------|-------|
| `skeleton` | الكروت، القوائم | Gradient متحرك |
| `spinner` | صور كبيرة | Loader دائري |
| `pulse` | Infinite scroll | Shimmer effect |

---

## 🧪 التجربة

لتجربة كل الميزات، افتح صفحة الاختبار:

```bash
# شغّل المشروع
npm run dev

# افتح في المتصفح:
http://localhost:3000/test-images
```

---

## 📚 Props الأساسية

```tsx
<SmartImage
  src="/image.jpg"           // مسار الصورة (إلزامي)
  alt="وصف"                  // وصف للصورة (إلزامي)
  
  // Lazy Loading
  lazy={true}                // تفعيل lazy loading
  
  // Loader Type
  loaderType="skeleton"      // نوع الـ loader
  showSpinner={true}         // عرض spinner
  
  // Error Handling
  fallbackSrc="/placeholder.jpg"  // صورة بديلة
  
  // Performance
  eager={true}               // تحميل فوري
  noFade={true}              // بدون fade effect
  
  // Advanced (فقط في shared/SmartImage)
  blurType="primary"         // نوع blur
  autoQuality={true}         // تحسين جودة تلقائي
  
  // Next.js Image Props
  fill                       // ملء الحاوية
  width={400}                // العرض
  height={300}               // الارتفاع
  className="object-cover"   // CSS classes
/>
```

---

## ✅ Checklist سريع

قبل استخدام SmartImage:

- [ ] اخترت بين `lazy` و `eager`
- [ ] اخترت `loaderType` المناسب
- [ ] أضفت `alt` text واضح
- [ ] حددت `width` و `height` (أو `fill`)
- [ ] أضفت `fallbackSrc` للصور الخارجية

---

## 🎯 أمثلة سريعة

### Avatar دائري

```tsx
<div className="w-16 h-16 rounded-full overflow-hidden">
  <SmartImage 
    src="/avatar.jpg"
    alt="مستخدم"
    lazy={true}
    loaderType="spinner"
    fill
  />
</div>
```

### Card مع صورة

```tsx
<div className="overflow-hidden rounded-xl">
  <div className="h-48 w-full">
    <SmartImage 
      src="/card-image.jpg"
      alt="كارد"
      lazy={true}
      loaderType="skeleton"
      fill
    />
  </div>
  <div className="p-4">
    <h3>عنوان</h3>
  </div>
</div>
```

### Gallery Grid

```tsx
<div className="grid grid-cols-3 gap-4">
  {images.map((img, i) => (
    <div key={i} className="aspect-square">
      <SmartImage 
        src={img.src}
        alt={img.alt}
        lazy={i > 2}  // أول 3 بدون lazy
        loaderType="pulse"
        fill
      />
    </div>
  ))}
</div>
```

---

## 🔗 المراجع

- **دليل شامل:** `docs/guides/GUIDE_IMAGE_LOADING.md`
- **أمثلة:** `docs/examples/IMAGE_LOADING_EXAMPLES.tsx`
- **ملخص:** `IMAGE_LOADING_IMPROVEMENTS.md`

---

## 💡 نصيحة سريعة

```tsx
// ✅ جيد
<SmartImage src="/img.jpg" alt="صورة" lazy={true} fill />

// ❌ تجنب
<Image src="/img.jpg" alt="" />  // بدون lazy أو تحسينات
```

---

**ابدأ الآن وحسّن تجربة المستخدم! 🚀**
