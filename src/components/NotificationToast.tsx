'use client'
import { Toaster, ToastIcon, resolveValue } from 'react-hot-toast'
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
      duration: 4000,
      className: 'bg-white text-gray-900 shadow-xl font-medium p-4 rounded-lg',
      success: {
        className: 'bg-green-50 text-green-700 border border-green-200',
        iconTheme: { primary: '#059669', secondary: '#fff' },
      },
      error: {
        className: 'bg-red-50 text-red-700 border border-red-200',
        iconTheme: { primary: '#dc2626', secondary: '#fff' },
      }
    }}
  >
    {(t) => {
      const customData = t as unknown as { data?: CustomToastData }

      return (
        <div className={t.className}>
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
        </div>
      )
    }}
  </Toaster>
)