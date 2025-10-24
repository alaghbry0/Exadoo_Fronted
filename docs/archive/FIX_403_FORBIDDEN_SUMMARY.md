# ✅ إصلاح مشكلة 403 Forbidden - ملخص الحل

## 🔴 المشكلة الأصلية

```
POST https://exadoo.onrender.com/api/payments/create-intent 403 (Forbidden)
```

### السبب:
- `src/utils/paymentIntent.ts` كان يستدعي Backend مباشرة من المتصفح
- Backend يتطلب **signature authentication** (X-Client-Id, X-Timestamp, X-Signature)
- لا يمكن إضافة `secret` في client-side (ثغرة أمنية)

---

## ✅ الحل المطبق

### 1. إنشاء API Route جديد (Server-Side Proxy)

**الملف:** `src/pages/api/payments/create-intent.ts`

```typescript
// ✅ Server-side فقط - آمن للـ secrets
import { makeSignatureHeaders } from "@/lib/signing";
import { resolveBackendConfig } from "@/lib/serverConfig";

export default async function handler(req, res) {
  const { baseUrl, clientId, secret } = resolveBackendConfig();

  // إضافة signature authentication
  const sigHeaders = makeSignatureHeaders({
    clientId,
    secret,
    fields: [telegramId, subscriptionPlanId, amount],
  });

  const headers = {
    "Content-Type": "application/json",
    ...sigHeaders,  // X-Client-Id, X-Timestamp, X-Signature
    "X-Telegram-Id": String(telegramId),
  };

  // إرسال الطلب للـ Backend مع التوقيع
  const upstream = await fetch(`${baseUrl}/api/payments/create-intent`, {
    method: "POST",
    headers,
    body: JSON.stringify(req.body),
  });

  return res.json(await upstream.json());
}
```

### 2. تعديل Client Function

**الملف:** `src/utils/paymentIntent.ts`

```typescript
// قبل (❌ خطأ):
const res = await fetch(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-intent`,
  { /* بدون signature */ }
);

// بعد (✅ صحيح):
const res = await fetch("/api/payments/create-intent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(req),
});
```

---

## 📁 الملفات المعدلة/المنشأة

### ملفات جديدة:
1. ✅ `src/pages/api/payments/create-intent.ts` - API route للـ proxy
2. ✅ `docs/API_SECURITY_PATTERN.md` - توثيق شامل للنمط

### ملفات معدلة:
1. ✅ `src/utils/paymentIntent.ts` - تعديل لاستخدام API route المحلي

---

## 🔐 كيف يعمل Signature Authentication

### 1. بناء الرسالة
```typescript
const message = [
  clientId,      // "webapp"
  timestamp,     // "1729740420"
  telegramId,    // "123456789"
  planId,        // "1"
  amount,        // "100"
].join(":");
// Result: "webapp:1729740420:123456789:1:100"
```

### 2. حساب HMAC SHA256
```typescript
const signature = crypto
  .createHmac("sha256", secret)
  .update(message)
  .digest("hex");
```

### 3. إرسال Headers
```typescript
{
  "X-Client-Id": "webapp",
  "X-Timestamp": "1729740420",
  "X-Signature": "abc123...",
  "X-Telegram-Id": "123456789"
}
```

---

## 🎯 النتيجة

✅ **403 Forbidden تم حلها!**

الطلب الآن:
1. يذهب من المتصفح → `/api/payments/create-intent` (Next.js API)
2. API Route يضيف signature headers (server-side آمن)
3. API Route يرسل الطلب للـ Backend مع التوقيع
4. Backend يقبل الطلب ويعالجه
5. النتيجة ترجع للمتصفح

---

## 📚 أمثلة مشابهة في المشروع

هذا النمط مستخدم في:
- ✅ `src/pages/api/confirm_payment.ts`
- ✅ `src/pages/api/trials/claim.ts`
- ✅ `src/pages/api/payments/create-intent.ts` (الجديد)

---

## ⚠️ قاعدة مهمة للمستقبل

> **لا تستدعي Backend APIs مباشرة من client-side إذا كانت تحتاج authentication!**

### ✅ استخدم API Route عندما:
- Endpoint يحتاج signature authentication
- Endpoint يحتاج secrets أو credentials
- Endpoint حساس (payments, user data, etc.)

### ✅ يمكن الاستدعاء المباشر عندما:
- Endpoint عام (public)
- Endpoint يستخدم token من localStorage فقط

---

## 🔍 Debugging Tips

إذا حصلت على 403 Forbidden مستقبلاً:

1. ✅ تحقق من وجود API route لـ endpoint
2. ✅ تحقق من signature headers في الطلب
3. ✅ تحقق من `fields` المستخدمة في التوقيع
4. ✅ راجع Backend logs لمعرفة سبب الرفض
5. ✅ تأكد من أن `secret` يطابق Backend

---

## 📖 للمزيد

راجع: `docs/API_SECURITY_PATTERN.md` للتفاصيل الكاملة والأمثلة.
