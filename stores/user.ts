import { defineStore } from 'pinia'

export interface UserState {
  userId: string | null
  isPremium: boolean
  testHistory: any[]
  preferences: {
    language: string
    theme: string
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: null,
    isPremium: false,
    testHistory: [],
    preferences: {
      language: 'ru',
      theme: 'light'
    }
  }),

  getters: {
    isAuthenticated: (state) => state.userId !== null,
    hasTestHistory: (state) => state.testHistory.length > 0
  },

  actions: {
    setUser(userId: string) {
      this.userId = userId
    },

    unlockPremium() {
      this.isPremium = true
    },

    addTestResult(result: any) {
      this.testHistory.unshift(result)
    },

    setPreference(key: keyof UserState['preferences'], value: string) {
      this.preferences[key] = value
    }
  }
})
