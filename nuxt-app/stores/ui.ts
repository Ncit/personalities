import { defineStore } from 'pinia'
import type { ScreenType, ModalState, Notification } from '~/utils/types'

export const useUIStore = defineStore('ui', {
  state: () => ({
    currentScreen: 'welcome' as ScreenType,
    modals: {
      types: false,
      premium: false,
      exitQuiz: false,
      subscription: false,
      clientCabinet: false
    } as ModalState,
    notifications: [] as Notification[],
    loading: false,
    loadingMessage: '',
    error: null as Error | null
  }),

  getters: {
    isModalOpen: (state) => {
      return Object.values(state.modals).some(isOpen => isOpen)
    },

    hasNotifications: (state) => {
      return state.notifications.length > 0
    }
  },

  actions: {
    // Screen management
    setScreen(screen: ScreenType) {
      this.currentScreen = screen
    },

    // Modal management
    openModal(modalName: keyof ModalState) {
      this.modals[modalName] = true
    },

    closeModal(modalName: keyof ModalState) {
      this.modals[modalName] = false
    },

    closeAllModals() {
      Object.keys(this.modals).forEach(key => {
        this.modals[key as keyof ModalState] = false
      })
    },

    toggleModal(modalName: keyof ModalState) {
      this.modals[modalName] = !this.modals[modalName]
    },

    // Notification management
    addNotification(
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info',
      duration = 3000
    ) {
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        type,
        message,
        duration,
        timestamp: Date.now()
      }

      this.notifications.push(notification)

      // Auto-remove notification after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(notification.id)
        }, duration)
      }

      return notification.id
    },

    removeNotification(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    clearNotifications() {
      this.notifications = []
    },

    // Loading state
    setLoading(loading: boolean, message = '') {
      this.loading = loading
      this.loadingMessage = message
    },

    // Error handling
    setError(error: Error | null) {
      this.error = error
      if (error) {
        this.addNotification(error.message, 'error', 5000)
      }
    },

    clearError() {
      this.error = null
    },

    // Utility methods
    showSuccess(message: string) {
      this.addNotification(message, 'success')
    },

    showError(message: string) {
      this.addNotification(message, 'error', 5000)
    },

    showWarning(message: string) {
      this.addNotification(message, 'warning')
    },

    showInfo(message: string) {
      this.addNotification(message, 'info')
    }
  }
})
