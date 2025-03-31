// src/components/NotificationToast.tsx
import { Toaster } from 'react-hot-toast'

export const NotificationToast = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      className: 'bg-white text-gray-900 shadow-xl font-medium',
      duration: 3000,
      success: {
        className: 'bg-green-50 text-green-700 border border-green-200',
        iconTheme: {
          primary: '#059669',
          secondary: '#fff',
        },
      },
      error: {
        className: 'bg-red-50 text-red-700 border border-red-200',
        iconTheme: {
          primary: '#dc2626',
          secondary: '#fff',
        },
      },
    }}
  />
)