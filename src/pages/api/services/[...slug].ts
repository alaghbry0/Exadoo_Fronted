// src/pages/api/services/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. قراءة المتغيرات السرية من بيئة الخادم (آمن)
  const baseUrl = process.env.NEXT_PUBLIC_APPLICATION_URL;
  const secret = process.env.NEXT_PUBLIC_APPLICATION_SECRET;

  if (!baseUrl || !secret) {
    return res.status(500).json({ status: 'fail', reason: 'Application URL or secret is not configured on the server.' });
  }

  // 2. استخراج المسار الديناميكي من الطلب
  // مثال: /api/services/123/abc -> slug = ['123', 'abc']
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : '';

  // 3. بناء عنوان URL للوجهة النهائية
  const destinationUrl = `https://exaado.plebits.com/api/getAllServicesForMiniApp/${path}`;

  try {
    // 4. إرسال الطلب من الخادم إلى الوجهة النهائية مع إضافة الترويسات السرية
    const apiResponse = await fetch(destinationUrl, {
      method: req.method, // استخدام نفس نوع الطلب الأصلي (GET)
      headers: {
        // هذه هي الترويسات التي يتوقعها الخادم البعيد
        'APPLICATION_URL': baseUrl,
        'secret': `Bearer ${secret}`,
        // يمكن إضافة ترويسات أخرى إذا لزم الأمر
        'Content-Type': 'application/json',
      },
    });

    // 5. قراءة الرد من الخادم البعيد
    const responseBody = await apiResponse.json();

    // 6. إرسال الرد (سواء كان ناجحًا أو فاشلاً) مرة أخرى إلى تطبيقك في المتصفح
    // مع نفس حالة الرد الأصلية
    res.status(apiResponse.status).json(responseBody);

  } catch (error) {
    console.error('[API PROXY ERROR]:', error);
    res.status(500).json({ status: 'fail', reason: 'An internal error occurred in the API proxy.' });
  }
}