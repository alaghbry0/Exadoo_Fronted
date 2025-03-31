'use client'
import React from 'react'
import { toast, Toaster } from 'react-hot-toast'
import type { Toast } from 'react-hot-toast'
import { FiCheckCircle, FiAlertTriangle, FiX, FiExternalLink } from 'react-icons/fi'

/* تعريف نوع Toast المخصص مع خاصية action إن وجدت */
type CustomToastType = Toast & {
  action?: {
    text: string
    onClick: () => void
  }
}

export const CustomToast: React.FC = () => {
  return (
    <Toaster position="top-center">
      {(t: CustomToastType) => {
        const { type, message, ariaProps } = t
        // استخراج role من ariaProps إن وُجد
        const { role: ariaRole, ...restAriaProps } = ariaProps || {}

        // تكوين التنسيق وفقًا لنوع الرسالة
        const toastConfigMapping = {
          success: {
            icon: <FiCheckCircle className="text-green-500 w-6 h-6" />,
            className: 'bg-green-50 text-green-700 border border-green-100'
          },
          error: {
            icon: <FiAlertTriangle className="text-red-500 w-6 h-6" />,
            className: 'bg-red-50 text-red-700 border border-red-100'
          },
          warning: {
            icon: <FiAlertTriangle className="text-yellow-500 w-6 h-6" />,
            className: 'bg-yellow-50 text-yellow-700 border border-yellow-100'
          },
          info: {
            icon: null,
            className: 'bg-gray-50 text-gray-700 border border-gray-100'
          }
        }
        const toastConfig =
          (toastConfigMapping as Record<string, { icon: React.ReactNode; className: string }>)[type] ||
          { icon: null, className: 'bg-gray-50 text-gray-700 border border-gray-100' }

        return (
          <div
            className={`${toastConfig.className} flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md`}
            role={ariaRole || 'alert'}
            {...restAriaProps}
          >
            {toastConfig.icon}
            <div className="flex-1">
              <div className="font-medium">{message}</div>
              {t.action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    t.action?.onClick()
                    toast.dismiss(t.id)
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-current hover:opacity-80"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>{t.action.text}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 hover:bg-black/5 rounded-full"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )
      }}
    </Toaster>
  )
}

// تعريف نوع المحتوى الخاص بالإشعارات
type ToastContent = {
  message: string
  action?: {
    text: string
    onClick: () => void
  }
}

export const showToast = {
  success: (content: string | ToastContent) => {
    if (typeof content === 'string') {
      toast.success(content)
    } else {
      toast.custom((t: CustomToastType) => (
        <div
          className="bg-green-50 text-green-700 border border-green-100 flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md"
          role="alert"
        >
          <FiCheckCircle className="text-green-500 w-6 h-6" />
          <div className="flex-1">
            <div className="font-medium">{content.message}</div>
            {content.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  content.action?.onClick()

                  toast.dismiss(t.id)
                }}
                className="mt-1 inline-flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>{content.action.text}</span>
              </button>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 hover:bg-black/5 rounded-full"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ), {
        icon: <FiCheckCircle className="text-green-500 w-6 h-6" />,
      })
    }
  },
  error: (message: string) => toast.error(message),
  warning: (content: ToastContent) =>
    toast.custom((t: CustomToastType) => (
      <div
        className="bg-yellow-50 text-yellow-700 border border-yellow-100 flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md"
        role="alert"
      >
        <FiAlertTriangle className="text-yellow-500 w-6 h-6" />
        <div className="flex-1">
          <div className="font-medium">{content.message}</div>
          {content.action && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                content.action?.onClick()

                toast.dismiss(t.id)
              }}
              className="mt-1 inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-800"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>{content.action.text}</span>
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-1 hover:bg-black/5 rounded-full"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    ), { duration: 15000 })
}

// تعريف واجهة Window الموسعة
declare global {
  interface Window {
    showToast: typeof showToast;
  }
}

// في نهاية الملف
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  console.log('يمكنك الآن استخدام showToast() في الكونسول');
}
