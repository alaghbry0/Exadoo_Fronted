// pages/api/image-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch'; // أو استخدم fetch العالمي إذا كان Node.js >= 18

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    console.log(`Proxying image from: ${url}`); // تسجيل URL المطلوب
    const imageRes = await fetch(url);

    if (!imageRes.ok) {
      console.error(`Failed to fetch image from ${url}. Status: ${imageRes.status} ${imageRes.statusText}`);
      // حاول قراءة نص الخطأ من المصدر إذا كان متاحًا
      let errorBody = `Failed to fetch image: ${imageRes.statusText}`;
       try {
         const bodyText = await imageRes.text();
         if (bodyText) errorBody += ` - Body: ${bodyText}`;
      } catch { /* ignore if can't read body */ }

      return res.status(imageRes.status).json({ error: errorBody });
    }

    const contentType = imageRes.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        console.error(`Invalid content type from ${url}: ${contentType}`);
        return res.status(500).json({ error: 'Invalid content type, not an image.' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // تخزين مؤقت لمدة يوم

    // تحويل الجسم إلى Buffer وإرساله
    const imageBuffer = await imageRes.arrayBuffer(); // استخدام arrayBuffer للحصول على البيانات الثنائية
    res.status(200).send(Buffer.from(imageBuffer)); // إرسال الـ Buffer

    // --- طريقة الـ Stream (احتفظ بها كبديل إذا لم تعمل طريقة Buffer لسبب ما) ---
    // if (imageRes.body) {
    //   imageRes.body.pipe(res);
    //   // يجب التأكد من معالجة أخطاء الـ stream أيضًا
    //   imageRes.body.on('error', (streamError) => {
    //     console.error('Stream error during piping:', streamError);
    //     // قد يكون من الصعب إرسال استجابة خطأ هنا لأن الرؤوس قد أُرسلت بالفعل
    //     res.end(); // إنهاء الاستجابة
    //   });
    // } else {
    //   console.error('Image response body is null');
    //   return res.status(500).json({ error: 'Image response body is null' });
    // }
    // -------------------------------------------------------------------------


  } catch (error: unknown) {
    const err = error as Error;
    console.error('Image proxy CATCH error:', err.message, err.stack);
    res.status(500).json({ error: 'Internal server error fetching image', details: err.message });
  }
}