// src/stores/loadingStore.ts
import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  loadingMessage: string
  startLoading: (message?: string) => void
  completeLoading: () => void
  setLoadingMessage: (message: string) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingMessage: 'جاري تحميل البيانات...',
  startLoading: (message = 'جاري تحميل البيانات...') =>
    set({ isLoading: true, loadingMessage: message }),
  completeLoading: () => set({ isLoading: false }),
  setLoadingMessage: (message) => set({ loadingMessage: message })
}))