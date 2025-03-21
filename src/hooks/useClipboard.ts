// src/hooks/useClipboard.ts
import { toast } from 'react-hot-toast'

export const useClipboard = () => {
  const copy = async (text: string) => {
    try {
      // طريقة بديلة لنسخ النص
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()

      if (document.execCommand('copy')) {
        toast.success('تم النسخ بنجاح!')
      } else {
        throw new Error('Clipboard access denied')
      }

      document.body.removeChild(textArea)
    } catch {
      toast.error('فشل في النسخ')
    }
  }

  return { copy }
}