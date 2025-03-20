// src/hooks/useClipboard.ts
import { toast } from 'react-hot-toast'

export const useClipboard = () => {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('تم النسخ بنجاح!')
    } catch  {
      toast.error('فشل في النسخ')
    }
  }

  return { copy }
}