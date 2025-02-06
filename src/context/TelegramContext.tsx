'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        initDataUnsafe?: {
          user?: {
            id?: number
          }
        }
        ready: () => void
        expand: () => void
        onEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void
        offEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void
        openInvoice?: (url: string, callback: (status: string) => void) => void
        showAlert?: (message: string, callback?: () => void) => void
      }
    }
  }
}

const TelegramContext = createContext<{
  telegramId: string | null
  isTelegramReady: boolean
  isLoading: boolean
  setTelegramId: (id: string | null) => void
}>( {
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  setTelegramId: () => {},
})

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [isTelegramReady, setIsTelegramReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ التحقق مما إذا كان التطبيق يعمل داخل تليجرام
  const isTelegramApp = typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined

  const initializeTelegram = useCallback(() => {
    try {
      if (!isTelegramApp) {
        console.log("✅ التطبيق يعمل خارج Telegram WebApp")
        setIsLoading(false)
        return
      }

      // ✅ التحقق من وجود `Telegram` قبل الوصول إليه
      if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
        console.warn("⚠️ Telegram WebApp غير متاح")
        setIsLoading(false)
        return
      }

      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      console.log("✅ تم تهيئة Telegram WebApp بنجاح")

      const userId = tg.initDataUnsafe?.user?.id?.toString() || null
      if (userId) {
        console.log("✅ Telegram User ID:", userId)
        setTelegramId(userId)
        localStorage.setItem("telegramId", userId) // ✅ حفظ المعرف محليًا
        setIsTelegramReady(true)
      } else {
        console.warn("⚠️ لم يتم العثور على معرف Telegram.")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("❌ خطأ أثناء تهيئة Telegram WebApp:", error)
      setIsLoading(false)
    }
  }, [isTelegramApp])

  useEffect(() => {
    // ✅ التحقق مما إذا كان `telegramId` محفوظًا محليًا
    if (typeof window !== 'undefined') {
      const storedTelegramId = localStorage.getItem("telegramId")
      if (storedTelegramId) {
        setTelegramId(storedTelegramId)
        setIsTelegramReady(true)
        setIsLoading(false)
        console.log("✅ تم استرجاع telegram_id من التخزين المحلي:", storedTelegramId)
        return
      }
    }

    // ✅ إذا لم يكن `telegramId` محفوظًا محليًا، قم بتحميله من تليجرام
    initializeTelegram()
  }, [initializeTelegram])

  return (
    <TelegramContext.Provider value={{ telegramId, isTelegramReady, isLoading, setTelegramId }}>
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => useContext(TelegramContext)
