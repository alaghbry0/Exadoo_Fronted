import { useEffect, useRef } from 'react';

/**
 * Hook لحبس التركيز (Focus Trap) داخل عنصر معين
 * مفيد للـ Modals و Dialogs لضمان عدم خروج التركيز خارج النافذة
 * 
 * @param isActive - هل الـ Focus Trap نشط
 * @returns ref للعنصر الذي سيحتوي على الـ Focus Trap
 * 
 * @example
 * ```tsx
 * const Modal = ({ isOpen, onClose }) => {
 *   const trapRef = useFocusTrap(isOpen);
 *   
 *   return (
 *     <div ref={trapRef} role="dialog">
 *       <button onClick={onClose}>إغلاق</button>
 *       <input type="text" />
 *     </div>
 *   );
 * };
 * ```
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // جميع العناصر القابلة للتركيز
    const focusableSelector = 
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // حفظ العنصر المركز عليه قبل فتح الـ Modal
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // التركيز على أول عنصر
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab - الرجوع للخلف
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab - التقدم للأمام
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);

    // Cleanup: إرجاع التركيز للعنصر السابق
    return () => {
      container.removeEventListener('keydown', handleTab);
      previouslyFocusedElement?.focus();
    };
  }, [isActive]);

  return containerRef;
};
