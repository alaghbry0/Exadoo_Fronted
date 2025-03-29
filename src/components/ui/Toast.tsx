'use client'
import React from 'react'
import { toast, Toaster } from 'react-hot-toast'
import type { Toast } from 'react-hot-toast'
import { FiCheckCircle, FiAlertTriangle, FiX, FiExternalLink } from 'react-icons/fi'

type CustomToastType = Toast & {
  action?: {
    text: string
    onClick: () => void
  }
}

export const CustomToast: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: 'bg-white text-gray-900 shadow-xl font-medium',
        success: {
          className: 'bg-green-50 text-green-700 border border-green-200',
        },
        error: {
          className: 'bg-red-50 text-red-700 border border-red-200',
        }
      }}
    >
      {(t: CustomToastType) => {
        const { type, message } = t

        const iconMapping = {
          success: <FiCheckCircle className="text-green-600 w-5 h-5" />,
          error: <FiAlertTriangle className="text-red-600 w-5 h-5" />,
          warning: <FiAlertTriangle className="text-yellow-600 w-5 h-5" />,
          info: null,
        }

        return (
          <div className={`${t.className} flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md`}>
            {iconMapping[type as keyof typeof iconMapping]}
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
          className="bg-green-50 text-green-700 border border-green-200 flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md"
          role="alert"
        >
          <FiCheckCircle className="text-green-600 w-5 h-5" />
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
      ))
    }
  },
  error: (message: string) => toast.error(message),
  warning: (content: ToastContent) =>
    toast.custom((t: CustomToastType) => (
      <div
        className="bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md"
        role="alert"
      >
        <FiAlertTriangle className="text-yellow-600 w-5 h-5" />
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