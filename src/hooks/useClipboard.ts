import { useState } from 'react';
import { showToast } from '@/components/ui/Toast'; // استخدام نظام التوست الخاص بك

export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string) => {
    // **الخيار الأول: استخدام واجهة Clipboard API الحديثة والآمنة**
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        showToast.success('تم النسخ بنجاح!');
        setTimeout(() => setIsCopied(false), timeout);
        return; // الخروج من الدالة بعد النجاح
      } catch (error) {
        console.error('فشل النسخ باستخدام Clipboard API الحديثة:', error);
        // لا تظهر رسالة خطأ هنا، بل انتقل للحل الاحتياطي
      }
    }

    // **الخيار الثاني: الحل الاحتياطي (Fallback) للبيئات المقيدة**
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // إخفاء العنصر عن العرض
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        setIsCopied(true);
        showToast.success('تم النسخ بنجاح!');
        setTimeout(() => setIsCopied(false), timeout);
      } else {
        throw new Error('فشل النسخ باستخدام الطريقة الاحتياطية.');
      }
    } catch (error) {
      console.error('فشل في نسخ النص بشكل كامل: ', error);
      showToast.error('فشل في نسخ النص. قد تكون هناك قيود في المتصفح.');
      setIsCopied(false);
    }
  };

  return { copy, isCopied };
};