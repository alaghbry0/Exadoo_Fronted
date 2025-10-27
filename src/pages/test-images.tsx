/**
 * 🧪 صفحة اختبار نظام تحميل الصور
 * 
 * هذه الصفحة لاختبار جميع ميزات SmartImage الجديدة.
 * يمكن الوصول إليها عبر: /test-images
 * 
 * احذف هذا الملف في الإنتاج أو اجعله متاحاً فقط في development.
 */

import { useState } from 'react';
import SmartImage from '@/shared/components/common/SmartImage';
import { Card } from '@/shared/components/ui/card';
import { LazyLoad } from '@/shared/components/common/LazyLoad';

export default function TestImagesPage() {
  const [selectedLoader, setSelectedLoader] = useState<'skeleton' | 'spinner' | 'pulse'>('skeleton');
  const [selectedBlur, setSelectedBlur] = useState<'light' | 'dark' | 'primary' | 'secondary' | 'neutral'>('light');

  // صور تجريبية
  const testImages = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    src: `https://picsum.photos/seed/${i + 1}/400/300`,
    alt: `صورة تجريبية ${i + 1}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-width-7xl mx-auto space-y-12">
        
        {/* العنوان */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🖼️ اختبار نظام تحميل الصور</h1>
          <p className="text-gray-600 dark:text-gray-400">
            تجربة جميع ميزات SmartImage المحسّن
          </p>
        </div>

        {/* التحكم */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">⚙️ الإعدادات</h2>
          
          {/* اختيار Loader Type */}
          <div className="space-y-2">
            <label className="font-semibold">نوع Loader:</label>
            <div className="flex gap-4">
              {(['skeleton', 'spinner', 'pulse'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedLoader(type)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedLoader === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار Blur Type */}
          <div className="space-y-2">
            <label className="font-semibold">نوع Blur Placeholder:</label>
            <div className="flex gap-4">
              {(['light', 'dark', 'primary', 'secondary', 'neutral'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedBlur(type)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedBlur === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* مثال 1: Hero Image (بدون lazy) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1️⃣ Hero Image (Eager Loading)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            صورة رئيسية بتحميل فوري، بدون lazy loading
          </p>
          
          <div className="relative h-[400px] w-full rounded-2xl overflow-hidden">
            <SmartImage
              src="https://picsum.photos/seed/hero/1200/400"
              alt="Hero Image"
              eager={true}
              noFade={true}
              disableSkeleton={true}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center space-y-4">
                <h3 className="text-4xl font-bold">Hero Section</h3>
                <p className="text-xl">تحميل فوري بدون تأخير</p>
              </div>
            </div>
          </div>
        </section>

        {/* مثال 2: الصور مع Lazy Loading */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2️⃣ Image Grid (Lazy Loading)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            قائمة صور مع lazy loading و {selectedLoader} loader
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.slice(0, 6).map((image, index) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative h-64 w-full">
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    lazy={index > 2} // أول 3 بدون lazy
                    loaderType={selectedLoader}
                    blurType={selectedBlur}
                    autoQuality={true}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold">{image.alt}</p>
                  <p className="text-sm text-gray-600">
                    {index > 2 ? 'Lazy Loaded' : 'Eager Loaded'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* مثال 3: Avatar مع fallback */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3️⃣ Avatars (مع Fallback)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            صور دائرية مع صورة بديلة عند الفشل
          </p>
          
          <div className="flex gap-4">
            {testImages.slice(0, 5).map((image) => (
              <div key={image.id} className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-blue-500">
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  lazy={true}
                  loaderType="spinner"
                  fallbackSrc="/11.png"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* مثال 4: مقارنة Loader Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4️⃣ مقارنة أنواع Loaders</h2>
          <p className="text-gray-600 dark:text-gray-400">
            شاهد الفرق بين skeleton, spinner, و pulse
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['skeleton', 'spinner', 'pulse'] as const).map((type) => (
              <Card key={type} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <SmartImage
                    src={`https://picsum.photos/seed/${type}/400/300`}
                    alt={`${type} loader`}
                    lazy={true}
                    loaderType={type}
                    blurType="neutral"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold capitalize">{type} Loader</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* مثال 5: Infinite Scroll Simulation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5️⃣ Infinite Scroll (محاكاة)</h2>
          <p className="text-gray-600 dark:text-gray-400">
            قائمة طويلة مع lazy loading - scroll لأسفل
          </p>
          
          <div className="space-y-4">
            {testImages.slice(6).map((image, index) => (
              <Card key={image.id} className="flex gap-4 p-4">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    lazy={true}
                    loaderType={selectedLoader}
                    blurType={selectedBlur}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg">{image.alt}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    هذه صورة تجريبية رقم {image.id}. يتم تحميلها فقط عند ظهورها في الشاشة.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Lazy Loaded
                    </span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      {selectedLoader}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* مثال 6: LazyLoad للمحتوى */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6️⃣ LazyLoad Component</h2>
          <p className="text-gray-600 dark:text-gray-400">
            تحميل lazy لأي محتوى (ليس فقط صور)
          </p>
          
          <LazyLoad
            fallback={
              <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse flex items-center justify-center">
                <p>جاري التحميل...</p>
              </div>
            }
            threshold={0.1}
            rootMargin="100px"
          >
            <Card className="p-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <h3 className="text-2xl font-bold mb-4">محتوى محمّل بـ Lazy!</h3>
              <p>
                هذا المحتوى تم تحميله فقط عند اقترابك منه. 
                رائع لتحسين الأداء!
              </p>
            </Card>
          </LazyLoad>
        </section>

        {/* معلومات إضافية */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold mb-4">💡 نصائح الاستخدام</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ افتح DevTools → Network لمشاهدة تحميل الصور التدريجي</li>
            <li>✅ scroll ببطء لترى lazy loading في العمل</li>
            <li>✅ جرّب تغيير نوع Loader والـ Blur</li>
            <li>✅ اختبر على Mobile و Desktop</li>
            <li>✅ جرّب Dark Mode</li>
          </ul>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>🖼️ نظام تحميل الصور المحسّن</p>
          <p>للمزيد من المعلومات، راجع: <code className="bg-gray-200 dark:bg-neutral-800 px-2 py-1 rounded">docs/guides/GUIDE_IMAGE_LOADING.md</code></p>
        </div>

      </div>
    </div>
  );
}
