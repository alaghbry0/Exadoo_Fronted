import { useEffect, useRef, useState } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Hook لإنشاء ARIA Live Region للإعلانات الديناميكية
 * يساعد Screen Readers على قراءة التحديثات الديناميكية
 * 
 * @returns كائن يحتوي على دالة announce ومتغيرات message و priority
 * 
 * @example
 * ```tsx
 * const Component = () => {
 *   const { announce, message, priority } = useAriaAnnouncer();
 *   
 *   const handleSave = async () => {
 *     await saveData();
 *     announce('تم حفظ البيانات بنجاح', 'polite');
 *   };
 *   
 *   return (
 *     <>
 *       <button onClick={handleSave}>حفظ</button>
 *       <div role={priority === 'assertive' ? 'alert' : 'status'} 
 *            aria-live={priority} 
 *            className="sr-only">
 *         {message}
 *       </div>
 *     </>
 *   );
 * };
 * ```
 */
export const useAriaAnnouncer = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('polite');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = (text: string, announcePriority: AnnouncementPriority = 'polite') => {
    // مسح أي رسالة سابقة
    setMessage('');
    setPriority(announcePriority);

    // تأخير صغير للسماح لـ Screen Reader بالتعرف على التغيير
    setTimeout(() => {
      setMessage(text);

      // مسح الرسالة بعد 5 ثوانٍ
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 5000);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announce,
    message,
    priority,
  };
};
