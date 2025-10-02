// hooks/useKeyboardSearch.ts

import { useEffect } from 'react'
import type { RefObject, FC } from 'react'

interface UseKeyboardSearchProps {
  inputRef: RefObject<HTMLInputElement>
  query: string
  onClear: () => void
}

/**
 * Hook لإضافة اختصارات لوحة المفاتيح للبحث
 * 
 * @param inputRef - مرجع حقل البحث
 * @param query - النص المكتوب حالياً
 * @param onClear - دالة لمسح البحث
 * 
 * @example
 * const inputRef = useRef<HTMLInputElement>(null)
 * const [query, setQuery] = useState('')
 * 
 * useKeyboardSearch({
 *   inputRef,
 *   query,
 *   onClear: () => setQuery('')
 * })
 */
export const useKeyboardSearch = ({
  inputRef,
  query,
  onClear,
}: UseKeyboardSearchProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: فتح البحث
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select() // تحديد النص الموجود
      }

      // ESC: مسح البحث أو إزالة التركيز
      if (e.key === 'Escape') {
        if (query) {
          e.preventDefault()
          onClear()
        } else {
          inputRef.current?.blur()
        }
      }

      // Ctrl/Cmd + /: تبديل التركيز على البحث
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        if (document.activeElement === inputRef.current) {
          inputRef.current?.blur()
        } else {
          inputRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputRef, query, onClear])
}


// ====================================
// استخدام في صفحة المتجر
// ====================================

/**
 * مثال على الاستخدام في ShopHome:
 * 
 * import { useKeyboardSearch, KeyboardHints } from '@/hooks/useKeyboardSearch'
 * 
 * export default function ShopHome() {
 *   const [query, setQuery] = useState('')
 *   const inputRef = useRef<HTMLInputElement>(null)
 * 
 *   useKeyboardSearch({
 *     inputRef,
 *     query,
 *     onClear: () => setQuery('')
 *   })
 * 
 *   return (
 *     <div>
 *       <input ref={inputRef} value={query} onChange={...} />
 *       <KeyboardHints />
 *     </div>
 *   )
 * }
 */