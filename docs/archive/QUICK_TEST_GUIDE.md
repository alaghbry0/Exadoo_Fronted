# 🧪 دليل الاختبار السريع - Service Worker

## 📋 الخطوات بالترتيب

### 1️⃣ تشغيل التطبيق
```bash
npm run dev
```

### 2️⃣ فتح التطبيق
افتح المتصفح على:
```
http://localhost:3000
```

### 3️⃣ فتح DevTools
اضغط **F12** أو **Ctrl + Shift + I**

### 4️⃣ التحقق من Console
يجب أن ترى:
```
[SW] Development mode - Service Worker enabled for testing
[SW] Service Worker registered successfully: http://localhost:3000/
```

### 5️⃣ فتح صفحة الأكاديمية
```
http://localhost:3000/academy
```

### 6️⃣ مراقبة Console
يجب أن ترى:
```
[SW] Installing Service Worker...
[SW] Caching static assets...
[SW] Service Worker installed successfully!
[SW] Activating Service Worker...
[SW] Service Worker activated! Ready to intercept requests.
[SW] Intercepting image request: /_next/image (Next.js)
[SW] → Fetching from network: /_next/image?url=https%3A%2F%2Fexaado.ple...
[SW] ✓ Cached for future: /_next/image?url=https%3A%2F%2Fexaado.ple...
```

### 7️⃣ إعادة تحميل الصفحة (F5)
يجب أن ترى:
```
[SW] Intercepting image request: /_next/image (Next.js)
[SW] ✓ Cache HIT (fresh): /_next/image?url=https%3A%2F%2Fexaado.ple...
```

### 8️⃣ فتح Network Tab
- Filter: **Img**
- لاحظ: `(from ServiceWorker)` أو `(disk cache)`
- Size: يجب أن يكون صغير جداً أو `(ServiceWorker)`

---

## 🧪 صفحة الاختبار التفاعلية

### افتح:
```
http://localhost:3000/test-image-caching.html
```

### يجب أن ترى:
- ✅ Service Worker: **مُسجَّل ✓**
- ✅ Cache Status: **مُفعَّل ✓**
- ✅ عدد الكاشات: **3** (images-v3, next-images-v1, static-v2)

---

## 🔍 التحقق من الكاش في Console

```javascript
// 1. التحقق من Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', !!reg);
  console.log('SW active:', !!reg?.active);
});

// 2. عرض الكاشات
caches.keys().then(keys => {
  console.log('Cache names:', keys);
});

// 3. عرض محتوى الكاش
caches.open('exaado-next-images-v1').then(async cache => {
  const requests = await cache.keys();
  console.log('Cached images:', requests.length);
  requests.slice(0, 5).forEach(req => console.log(req.url));
});

// 4. حساب حجم الكاش
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  console.log(`Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

getCacheSize();
```

---

## ⚠️ استكشاف الأخطاء

### المشكلة: Service Worker لا يظهر
**الحل:**
```javascript
// إعادة تسجيل Service Worker
navigator.serviceWorker.getRegistration()
  .then(reg => reg?.unregister())
  .then(() => location.reload());
```

### المشكلة: الصور لا تُخزن
**الأسباب المحتملة:**
1. ✅ Service Worker لم يُفعَّل بعد (انتظر قليلاً)
2. ✅ الصفحة مفتوحة من `file://` بدلاً من `http://`
3. ✅ تحتاج إعادة تحميل الصفحة (F5) بعد تسجيل SW

**التحقق:**
```javascript
// في Console
navigator.serviceWorker.controller
// إذا كانت null، Service Worker لم يتحكم بالصفحة بعد
// Reload الصفحة (F5) مرة واحدة
```

### المشكلة: Next.js يعيد التشغيل
إذا رأيت:
```
⚠ Found a change in next.config.ts. Restarting the server...
```

انتظر حتى يكتمل التشغيل ثم جرب مرة أخرى.

---

## 📊 النتائج المتوقعة

### الزيارة الأولى:
- ⏱️ **وقت التحميل:** ~10-15 ثانية
- 📊 **Requests:** ~100 requests
- 📦 **Data Transfer:** ~5-10 MB
- ✅ **الصور تُخزن** في الكاش

### الزيارات التالية:
- ⏱️ **وقت التحميل:** ~1-2 ثانية ⚡
- 📊 **Requests:** ~10-20 requests
- 📦 **Data Transfer:** ~500 KB
- ✅ **معظم الصور من الكاش** (ServiceWorker)

### التحسين:
- 🚀 **93% تقليل** في Requests
- 📉 **87% تقليل** في Data Transfer
- ⚡ **85-90% أسرع** في التحميل

---

## 🎯 نصائح

1. **افتح التطبيق دائماً من `http://localhost:3000`**
   - ❌ ليس من `file://`
   - ✅ من المتصفح مباشرة

2. **إعادة تحميل واحدة بعد التسجيل**
   - بعد أول زيارة، اضغط F5 مرة واحدة
   - بعدها Service Worker سيعمل تلقائياً

3. **راقب Console دائماً**
   - لرؤية Cache HITs vs Network fetches
   - للتأكد من عمل Service Worker

4. **استخدم Network Tab**
   - Filter: Img
   - ابحث عن `(from ServiceWorker)`

---

## 🔄 مسح الكاش (عند الحاجة)

```javascript
// في Console
caches.keys().then(keys => 
  Promise.all(keys.map(k => caches.delete(k)))
).then(() => {
  console.log('All caches cleared!');
  location.reload();
});
```

---

**جاهز للاختبار! 🚀**
