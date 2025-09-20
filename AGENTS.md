# Data Sources — Mini-App Services (Gated by `isLinked`)

## Preconditions

جميع الجلبات تتم بعد:

* `isTelegramReady === true` من `TelegramProvider`
* `useUserStore().isLinked === true`
* وجود `telegramId` صالح في المتجر

---

## Base

**Base URL**: `process.env.NEXT_PUBLIC_APPLICATION_URL`

**Required Headers (لكل الطلبات):**

```
APPLICATION_URL: process.env.NEXT_PUBLIC_APPLICATION_URL
secret: Bearer ${process.env.NEXT_PUBLIC_APPLICATION_SECRET}
```

⚠️ **ملاحظة أمنية**: لو الواجهة عميلة (public), استخدم بروكسي سيرفري (Next.js API routes) لإضافة الهيدرز الحساسة وعدم كشف السر في المتصفح.

---

## Endpoints

> استبدل `{telegramId}` بالقيمة من `useUserStore()` ولا تستخدم قيم ثابتة.

### All Services (aggregate)

```
GET /api/getAllServicesForMiniApp/{telegramId}/
```

يرجّع كل تفاصيل الميني-آب والخدمات.

---

### Consultancy

```
GET /api/getAllServicesForMiniApp/{telegramId}/consultancy
```

تفاصيل خدمة الاستشارة + السعر + مواعيد الحجز المتاحة + حجوزاتك (إن وجدت).

---

### My Enrollments

```
GET /api/getAllServicesForMiniApp/{telegramId}/my_enrollments
```

كل اشتراكاتك في الكورسات والـ bundles.

---

### Academy

```
GET /api/getAllServicesForMiniApp/{telegramId}/academy
```

تفاصيل الأكاديمية: كورسات، Bundles، تصنيفات، عروض، إعلانات… + كل اشتراكاتك (نفس بيانات endpoint الأعلى).

---

### Utility Trading Panels

```
GET /api/getAllServicesForMiniApp/{telegramId}/utility_trading_panels
```

جميع خدمات الـ trading panels + التفاصيل والأسعار + اشتراكاتك وتواريخ الانتهاء.

---

### Signals

```
GET /api/getAllServicesForMiniApp/{telegramId}/signals
```

كل خدمات الإشارات في التطبيق الرئيسي (مو الميني-آب) + أسعار ومدة كل اشتراك + اشتراكك وتاريخ الانتهاء.

---

### Buy Indicators

```
GET /api/getAllServicesForMiniApp/{telegramId}/buy_indicators
```

تفاصيل المؤشرات على Exaado + الأسعار + مدة الاشتراك + اشتراكك وتاريخ النهاية.
