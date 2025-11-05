import { defineStore } from 'pinia'
import type { VKUser, VKPaymentStatus } from '~/utils/types'

export const useVKStore = defineStore('vk', {
  state: () => ({
    bridge: null as any,
    isVKPlatform: false,
    isInitialized: false,
    vkUser: null as VKUser | null,
    paymentStatus: null as VKPaymentStatus | null,
    isLoading: false,
    error: null as Error | null
  }),

  getters: {
    isVKEnvironment: (state) => {
      return state.isVKPlatform && state.bridge !== null
    },

    userDisplayName: (state): string => {
      if (state.vkUser) {
        return `${state.vkUser.first_name} ${state.vkUser.last_name}`
      }
      return ''
    },

    isUserPremium: (state): boolean => {
      return state.vkUser?.is_premium || false
    }
  },

  actions: {
    // Set bridge
    setBridge(bridge: any) {
      this.bridge = bridge
      this.isVKPlatform = true
    },

    // Set initialized
    setInitialized(initialized: boolean) {
      this.isInitialized = initialized
    },

    // Set VK user
    setUser(user: VKUser) {
      this.vkUser = user
      this.saveToStorage()
    },

    // Update user
    updateUser(updates: Partial<VKUser>) {
      if (this.vkUser) {
        this.vkUser = { ...this.vkUser, ...updates }
        this.saveToStorage()
      }
    },

    // Set premium status
    setPremiumStatus(isPremium: boolean) {
      if (this.vkUser) {
        this.vkUser.is_premium = isPremium
        this.saveToStorage()
      }
    },

    // Set payment status
    setPaymentStatus(status: VKPaymentStatus) {
      this.paymentStatus = status
    },

    // Clear payment status
    clearPaymentStatus() {
      this.paymentStatus = null
    },

    // Set loading
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    // Set error
    setError(error: Error | null) {
      this.error = error
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Reset VK state
    reset() {
      this.bridge = null
      this.isVKPlatform = false
      this.isInitialized = false
      this.vkUser = null
      this.paymentStatus = null
      this.error = null
      this.clearStorage()
    },

    // Save to localStorage
    saveToStorage() {
      if (process.client) {
        try {
          const data = {
            vkUser: this.vkUser,
            isVKPlatform: this.isVKPlatform
          }
          localStorage.setItem('mbti_vk_data', JSON.stringify(data))
        } catch (error) {
          console.warn('Failed to save VK data to localStorage:', error)
        }
      }
    },

    // Load from localStorage
    loadFromStorage() {
      if (process.client) {
        try {
          const savedData = localStorage.getItem('mbti_vk_data')
          if (savedData) {
            const data = JSON.parse(savedData)
            this.vkUser = data.vkUser
            // Don't restore isVKPlatform - should be detected at runtime
          }
        } catch (error) {
          console.warn('Failed to load VK data from localStorage:', error)
        }
      }
    },

    // Clear storage
    clearStorage() {
      if (process.client) {
        try {
          localStorage.removeItem('mbti_vk_data')
        } catch (error) {
          console.warn('Failed to clear VK data from localStorage:', error)
        }
      }
    }
  }
})
