'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// ✅ تعريف `Telegram` في `window` لمنع أخطاء TypeScript
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
  isTelegramApp: boolean
  setTelegramId: (id: string | null) => void
}>({
  telegramId: null,
  isTelegramReady: false,
  isLoading: true,
  isTelegramApp: false,
  setTelegramId: () => {},
})

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [isTelegramReady, setIsTelegramReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ التحقق مما إذا كان التطبيق يعمل داخل تليجرام
  const isTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp

  const initializeTelegram = useCallback(() => {
    try {
      if (!isTelegramApp) {
        console.log("✅ التطبيق يعمل خارج Telegram WebApp")
        setIsLoading(false)
        return
      }

      if (!window.Telegram?.WebApp) {
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
        sessionStorage.setItem("telegramId", userId) // ✅ استخدام `sessionStorage` لتجنب إعادة الجلب من API
        localStorage.setItem("telegramId", userId) // ✅ حفظ نسخة احتياطية في `localStorage`
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
    if (typeof window !== 'undefined') {
      // ✅ محاولة استرجاع `telegramId` من `sessionStorage` أو `localStorage`
      const storedTelegramId = sessionStorage.getItem("telegramId") || localStorage.getItem("telegramId")
      if (storedTelegramId) {
        setTelegramId(storedTelegramId)
        setIsTelegramReady(true)
        setIsLoading(false)
        console.log("✅ تم استرجاع telegram_id من التخزين:", storedTelegramId)
        return
      }
    }

    // ✅ إذا لم يكن `telegramId` محفوظًا، قم بتحميله من تليجرام بعد تأخير بسيط
    setTimeout(() => {
      initializeTelegram()
    }, 500) // تحسين تجربة المستخدم بتأخير بسيط
  }, [initializeTelegram])

  return (
    <TelegramContext.Provider value={{ telegramId, isTelegramReady, isLoading, isTelegramApp, setTelegramId }}>
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => useContext(TelegramContext)
