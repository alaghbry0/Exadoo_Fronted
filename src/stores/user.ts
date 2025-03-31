import { create } from 'zustand'

interface UserState {
  telegramId: number
  // ... other user data
}

export const useUserStore = create<UserState>(() => ({
  telegramId: 0,
  // ... other user data
}))