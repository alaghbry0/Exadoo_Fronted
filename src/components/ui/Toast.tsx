'use client'
import { toast, Toaster } from 'react-hot-toast'
import type { Toast } from 'react-hot-toast'
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi'
import type { ReactNode } from 'react'

const toastConfig = {
  success: {
    icon: <FiCheckCircle className="text-green-500 w-6 h-6" />,
    className: 'bg-green-50 text-green-700 border border-green-100'
  },
  error: {
    icon: <FiAlertTriangle className="text-red-500 w-6 h-6" />,
    className: 'bg-red-50 text-red-700 border border-red-100'
  }
} as const

export const CustomToast = () => {
  return (
    <Toaster position="top-center">
      {(t: Toast) => {
        const type = t.type as keyof typeof toastConfig
        const config = toastConfig[type] || {
          icon: <FiAlertTriangle className="text-gray-500 w-6 h-6" />,
          className: 'bg-gray-50 text-gray-700 border border-gray-100'
        }

        return (
          <div className={`${config.className} flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg`}>
            {config.icon}
            <span className="font-medium">{t.message}</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-2 p-1 hover:bg-opacity-20 rounded-full"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )
      }}
    </Toaster>
  )
}

export const showToast = {
  success: (message: string | ReactNode) => toast.success(message),
  error: (message: string | ReactNode) => toast.error(message)
}