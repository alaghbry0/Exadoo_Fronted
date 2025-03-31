import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    telegramId: 0,
    // ... other user data
  }),
  // ... actions and getters
})