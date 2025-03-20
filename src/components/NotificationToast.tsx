// src/components/NotificationToast.tsx
import { Toaster } from 'react-hot-toast'

export const NotificationToast = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      className: 'bg-white text-gray-900 shadow-lg font-medium',
      duration: 2000,
    }}
  />
)