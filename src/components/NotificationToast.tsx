'use client'
import { Toaster, ToastIcon, resolveValue } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { NotificationType, ToastAction } from '@/typesPlan'

interface CustomToastData {
  type?: NotificationType
  invite_link?: string
  action?: ToastAction
}

export const NotificationToast = () => (
  <Toaster
    position="top-center"
    gutter={12}
    containerStyle={{ marginTop: '1rem' }}
    toastOptions={{
      duration: 4000, // Default duration
      className: 'relative flex items-start p-4 rounded-lg shadow-lg font-medium',
      success: {
        duration: 4000,
      },
      error: {
        duration: 4000,
      },
    }}
  >
    {(t) => {
      const customData = t as unknown as { data?: CustomToastData }
      const toastType = customData.data?.type || t.type

      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className={`w-full max-w-md transition-all duration-300 ${
            toastType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            toastType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            toastType === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            toastType === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-purple-50 text-purple-700 border border-purple-200'
          }`}
        >
          <div className="flex items-start">
            <ToastIcon toast={t} />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{resolveValue(t.message, t)}</p>
              {(customData.data?.invite_link || customData.data?.action) && (
                <div className="mt-2 flex gap-2">
                  {customData.data?.invite_link && (
                    <a
                      href={customData.data.invite_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      انضم الآن
                    </a>
                  )}
                  {customData.data?.action && (
                    <button
                      onClick={customData.data.action.onClick}
                      className="inline-block px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {customData.data.action.text}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )
    }}
  </Toaster>
)