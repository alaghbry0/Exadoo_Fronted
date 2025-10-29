# 🔐 API Security Pattern - نمط أمان الـ API

## المشكلة

عند استدعاء Backend APIs مباشرة من المتصفح (client-side)، يرفض Backend الطلب بـ **403 Forbidden** لأنه يتوقع **signature authentication**.

## ❌ الطريقة الخاطئة

```typescript
// ❌ خطأ أمني - استدعاء مباشر من المتصفح بدون signature
export async function createPaymentIntent(req: PaymentIntentRequest) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-intent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }
  );
  return res.json();
}
```

**المشاكل:**
- ❌ لا يوجد signature authentication
- ❌ لا يمكن إضافة `secret` في client-side (ثغرة أمنية)
- ❌ Backend يرفض الطلب بـ 403 Forbidden

## ✅ الطريقة الصحيحة

### 1. إنشاء API Route (Server-Side Proxy)

```typescript
// src/pages/api/payments/create-intent.ts
import { makeSignatureHeaders } from "@/lib/signing";
import { resolveBackendConfig } from "@/lib/serverConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { baseUrl, clientId, secret } = resolveBackendConfig();

  // إنشاء signature headers (آمن - server-side only)
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

  const upstream = await fetch(`${baseUrl}/api/payments/create-intent`, {
    method: "POST",
    headers,
    body: JSON.stringify(req.body),
  });

  return res.json(await upstream.json());
}
```

### 2. استدعاء API Route من Client

```typescript
// src/utils/paymentIntent.ts
export async function createPaymentIntent(req: PaymentIntentRequest) {
  // ✅ استدعاء API route المحلي
  const res = await fetch("/api/payments/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return res.json();
}
```

## 🔑 Signature Authentication

Backend يتوقع هذه الـ headers:

```typescript
{
  "X-Client-Id": "webapp",           // من env: CLIENT_ID
  "X-Timestamp": "1729740420",       // Unix timestamp
  "X-Signature": "abc123...",        // HMAC SHA256
  "X-Telegram-Id": "123456789"       // User ID
}
```

### كيفية حساب الـ Signature:

```typescript
// 1. بناء الرسالة
const message = [clientId, timestamp, ...fields].join(":");
// مثال: "webapp:1729740420:123456789:1:100"

// 2. حساب HMAC SHA256
const signature = crypto
  .createHmac("sha256", secret)
  .update(message)
  .digest("hex");
```

## 📋 أمثلة موجودة في المشروع

### ✅ API Routes تستخدم النمط الصحيح:

- `src/pages/api/confirm_payment.ts`
- `src/pages/api/payments/create-intent.ts`
- `src/pages/api/trials/claim.ts`

### 🔧 Utils تستدعي API Routes المحلية:

- `src/utils/paymentIntent.ts` → `/api/payments/create-intent`

## ⚠️ قاعدة مهمة

> **لا تستدعي Backend APIs مباشرة من client-side إذا كانت تحتاج authentication!**

### متى تستخدم API Route:

- ✅ Endpoints تحتاج signature authentication
- ✅ Endpoints تحتاج secrets أو credentials
- ✅ Endpoints حساسة (payments, user data, etc.)

### متى يمكن الاستدعاء المباشر:

- ✅ Public endpoints (لا تحتاج authentication)
- ✅ Endpoints تستخدم token من localStorage فقط

## 🛠️ كيف تضيف endpoint جديد

### 1. إنشاء API Route

```typescript
// src/pages/api/[feature]/[endpoint].ts
import { makeSignatureHeaders } from "@/lib/signing";
import { resolveBackendConfig } from "@/lib/serverConfig";

export default async function handler(req, res) {
  const { baseUrl, clientId, secret } = resolveBackendConfig();
  
  const sigHeaders = makeSignatureHeaders({
    clientId,
    secret,
    fields: [/* fields للتوقيع */],
  });

  const upstream = await fetch(`${baseUrl}/api/[endpoint]`, {
    method: req.method,
    headers: { ...sigHeaders, "X-Telegram-Id": String(telegramId) },
    body: JSON.stringify(req.body),
  });

  return res.json(await upstream.json());
}
```

### 2. إنشاء Client Function

```typescript
// src/utils/[feature].ts
export async function callEndpoint(data) {
  const res = await fetch("/api/[feature]/[endpoint]", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

## 🔍 Debugging

إذا حصلت على 403 Forbidden:

1. ✅ تحقق من وجود signature headers في الطلب
2. ✅ تحقق من صحة `X-Signature` (قارن مع Backend logs)
3. ✅ تحقق من `X-Timestamp` (يجب أن يكون حديث)
4. ✅ تحقق من `fields` المستخدمة في التوقيع (يجب أن تطابق Backend)
5. ✅ تحقق من `secret` (يجب أن يطابق Backend)

## 📚 مراجع

- `src/lib/signing.ts` - دوال التوقيع
- `src/lib/serverConfig.ts` - إعدادات Backend
- `src/pages/api/confirm_payment.ts` - مثال كامل
