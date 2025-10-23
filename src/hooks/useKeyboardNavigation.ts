import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  /** دالة تُستدعى عند الضغط على Escape */
  onEscape?: () => void;
  /** دالة تُستدعى عند الضغط على Enter */
  onEnter?: () => void;
  /** دالة تُستدعى عند الضغط على Arrow Up */
  onArrowUp?: () => void;
  /** دالة تُستدعى عند الضغط على Arrow Down */
  onArrowDown?: () => void;
  /** دالة تُستدعى عند الضغط على Arrow Left */
  onArrowLeft?: () => void;
  /** دالة تُستدعى عند الضغط على Arrow Right */
  onArrowRight?: () => void;
  /** هل الـ Hook نشط */
  isActive?: boolean;
}

/**
 * Hook لإدارة التنقل بالكيبورد
 * يوفر دعم كامل لمفاتيح الأسهم و Escape و Enter
 * 
 * @param options - خيارات التنقل
 * 
 * @example
 * ```tsx
 * const Dropdown = ({ isOpen, onClose }) => {
 *   useKeyboardNavigation({
 *     onEscape: onClose,
 *     onArrowDown: () => focusNextItem(),
 *     onArrowUp: () => focusPreviousItem(),
 *     isActive: isOpen
 *   });
 *   
 *   return <div>...</div>;
 * };
 * ```
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    isActive = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault();
            onArrowRight();
          }
          break;
      }
    },
    [isActive, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]
  );

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown]);
};

/**
 * Hook للتنقل بين عناصر قائمة باستخدام مفاتيح الأسهم
 * 
 * @param itemsCount - عدد العناصر في القائمة
 * @param onSelect - دالة تُستدعى عند اختيار عنصر
 * @param isActive - هل الـ Hook نشط
 * @returns الفهرس الحالي المحدد
 * 
 * @example
 * ```tsx
 * const List = ({ items }) => {
 *   const selectedIndex = useListNavigation(
 *     items.length,
 *     (index) => selectItem(items[index]),
 *     true
 *   );
 *   
 *   return items.map((item, i) => (
 *     <div key={i} className={i === selectedIndex ? 'selected' : ''}>
 *       {item}
 *     </div>
 *   ));
 * };
 * ```
 */
export const useListNavigation = (
  itemsCount: number,
  onSelect?: (index: number) => void,
  isActive = true
) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useKeyboardNavigation({
    onArrowDown: () => {
      setSelectedIndex((prev) => (prev + 1) % itemsCount);
    },
    onArrowUp: () => {
      setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
    },
    onEnter: () => {
      if (onSelect) {
        onSelect(selectedIndex);
      }
    },
    isActive,
  });

  return selectedIndex;
};

// Import React for useState
import React from 'react';
