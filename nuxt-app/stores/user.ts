import { defineStore } from 'pinia'
import type { UserInfo, UserPreferences, QuizHistory, Locale, Theme } from '~/utils/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    isPremium: false,
    preferences: {
      theme: 'light' as Theme,
      locale: 'ru' as Locale,
      notifications: true,
      analytics: true
    } as UserPreferences,
    history: [] as QuizHistory[],
    isAuthenticated: false
  }),

  getters: {
    displayName: (state): string => {
      if (state.userInfo?.firstName && state.userInfo?.lastName) {
        return `${state.userInfo.firstName} ${state.userInfo.lastName}`
      }
      return 'Guest'
    },

    currentLocale: (state): Locale => {
      return state.preferences.locale
    },

    currentTheme: (state): Theme => {
      return state.preferences.theme
    }
  },

  actions: {
    // Set user info
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.isPremium = userInfo.isPremium || false
      this.isAuthenticated = true

      this.saveToStorage()
    },

    // Update user info
    updateUserInfo(updates: Partial<UserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...updates }
        this.saveToStorage()
      }
    },

    // Set premium status
    setPremium(isPremium: boolean) {
      this.isPremium = isPremium
      if (this.userInfo) {
        this.userInfo.isPremium = isPremium
      }
      this.saveToStorage()
    },

    // Set theme
    setTheme(theme: Theme) {
      this.preferences.theme = theme
      this.saveToStorage()

      // Apply theme to document
      if (process.client) {
        document.documentElement.setAttribute('data-theme', theme)
      }
    },

    // Set locale
    setLocale(locale: Locale) {
      this.preferences.locale = locale
      this.saveToStorage()
    },

    // Update preferences
    updatePreferences(preferences: Partial<UserPreferences>) {
      this.preferences = { ...this.preferences, ...preferences }
      this.saveToStorage()
    },

    // Add quiz to history
    addToHistory(history: QuizHistory) {
      this.history.unshift(history)

      // Keep only last 10 quizzes
      if (this.history.length > 10) {
        this.history = this.history.slice(0, 10)
      }

      this.saveToStorage()
    },

    // Clear history
    clearHistory() {
      this.history = []
      this.saveToStorage()
    },

    // Logout
    logout() {
      this.userInfo = null
      this.isPremium = false
      this.isAuthenticated = false
      this.clearStorage()
    },

    // Save to localStorage
    saveToStorage() {
      if (process.client) {
        try {
          const data = {
            userInfo: this.userInfo,
            isPremium: this.isPremium,
            preferences: this.preferences,
            history: this.history,
            isAuthenticated: this.isAuthenticated
          }
          localStorage.setItem('mbti_user_data', JSON.stringify(data))
        } catch (error) {
          console.warn('Failed to save user data to localStorage:', error)
        }
      }
    },

    // Load from localStorage
    loadFromStorage() {
      if (process.client) {
        try {
          const savedData = localStorage.getItem('mbti_user_data')
          if (savedData) {
            const data = JSON.parse(savedData)
            this.userInfo = data.userInfo
            this.isPremium = data.isPremium || false
            this.preferences = data.preferences || this.preferences
            this.history = data.history || []
            this.isAuthenticated = data.isAuthenticated || false
          }

          // Migrate old data
          this.migrateOldData()
        } catch (error) {
          console.warn('Failed to load user data from localStorage:', error)
        }
      }
    },

    // Clear storage
    clearStorage() {
      if (process.client) {
        try {
          localStorage.removeItem('mbti_user_data')
        } catch (error) {
          console.warn('Failed to clear user data from localStorage:', error)
        }
      }
    },

    // Migrate old localStorage data
    migrateOldData() {
      if (process.client) {
        try {
          const oldState = localStorage.getItem('mbti_state')
          if (oldState && !localStorage.getItem('mbti_migrated')) {
            const parsed = JSON.parse(oldState)

            // Migrate theme and language
            if (parsed.theme) {
              this.setTheme(parsed.theme)
            }
            if (parsed.language) {
              this.setLocale(parsed.language)
            }

            // Mark as migrated
            localStorage.setItem('mbti_migrated', 'true')
          }
        } catch (error) {
          console.warn('Failed to migrate old data:', error)
        }
      }
    }
  }
})
