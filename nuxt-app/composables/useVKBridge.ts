import type { VKUser } from '~/utils/types'

export const useVKBridge = () => {
  const vkStore = useVKStore()
  const userStore = useUserStore()
  const uiStore = useUIStore()
  const { trackEvent } = useAnalytics()

  /**
   * Initialize VK Bridge
   */
  const initBridge = async () => {
    if (typeof window === 'undefined') return

    try {
      // Check if VK Bridge is available
      if (typeof (window as any).vkBridge !== 'undefined') {
        const bridge = (window as any).vkBridge

        // Set bridge in store
        vkStore.setBridge(bridge)

        // Send init event
        await bridge.send('VKWebAppInit')

        vkStore.setInitialized(true)

        // Track initialization
        trackEvent('vk_bridge_initialized')

        // Subscribe to bridge events
        bridge.subscribe(handleBridgeEvent)

        // Get user info
        await getUserInfo()

        // Configure appearance
        await configureAppearance()

        return true
      } else {
        vkStore.setInitialized(false)
        return false
      }
    } catch (error) {
      console.error('Failed to initialize VK Bridge:', error)
      vkStore.setError(error as Error)
      return false
    }
  }

  /**
   * Handle VK Bridge events
   */
  const handleBridgeEvent = (event: any) => {
    const { type, data } = event.detail || event

    switch (type) {
      case 'VKWebAppUpdateConfig':
        handleConfigUpdate(data)
        break
      case 'VKWebAppGetUserInfoResult':
        handleUserInfo(data)
        break
      case 'VKWebAppShowOrderBoxResult':
        handlePaymentResult(data)
        break
      default:
        console.log('Unhandled VK Bridge event:', type, data)
    }
  }

  /**
   * Handle config update
   */
  const handleConfigUpdate = (data: any) => {
    if (data.scheme) {
      userStore.setTheme(data.scheme)
    }
  }

  /**
   * Handle user info
   */
  const handleUserInfo = (data: any) => {
    const vkUser: VKUser = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      photo_url: data.photo_200 || data.photo_100
    }

    vkStore.setUser(vkUser)

    // Update user store
    userStore.setUserInfo({
      id: data.id.toString(),
      firstName: data.first_name,
      lastName: data.last_name,
      photoUrl: data.photo_url,
      isPremium: userStore.isPremium,
      locale: userStore.currentLocale,
      theme: userStore.currentTheme
    })

    trackEvent('vk_user_info_received', {
      user_id: data.id
    })
  }

  /**
   * Handle payment result
   */
  const handlePaymentResult = async (data: any) => {
    if (data.success) {
      // Update premium status
      userStore.setPremium(true)
      vkStore.setPremiumStatus(true)

      uiStore.showSuccess('Premium subscription activated!')

      trackEvent('vk_payment_success', {
        order_id: data.order_id
      })

      // Refresh the app
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      uiStore.showError('Payment failed. Please try again.')

      trackEvent('vk_payment_failed', {
        error: data.error_type
      })
    }
  }

  /**
   * Get user info
   */
  const getUserInfo = async () => {
    if (!vkStore.bridge) return null

    try {
      const result = await vkStore.bridge.send('VKWebAppGetUserInfo')
      handleUserInfo(result)
      return result
    } catch (error) {
      console.error('Failed to get user info:', error)
      return null
    }
  }

  /**
   * Configure app appearance
   */
  const configureAppearance = async () => {
    if (!vkStore.bridge) return

    try {
      await vkStore.bridge.send('VKWebAppSetViewSettings', {
        status_bar_style: 'light'
      })
    } catch (error) {
      console.warn('Failed to configure appearance:', error)
    }
  }

  /**
   * Show payment order box
   */
  const showOrderBox = async (item: string = 'premium_subscription') => {
    if (!vkStore.bridge) {
      uiStore.showError('VK Bridge is not available')
      return false
    }

    try {
      vkStore.setLoading(true)

      const result = await vkStore.bridge.send('VKWebAppShowOrderBox', {
        type: 'item',
        item
      })

      trackEvent('vk_payment_initiated', { item })

      return result
    } catch (error) {
      console.error('Failed to show order box:', error)
      uiStore.showError('Failed to open payment dialog')
      trackEvent('vk_payment_error', { error: (error as Error).message })
      return false
    } finally {
      vkStore.setLoading(false)
    }
  }

  /**
   * Share results
   */
  const shareResults = async (personalityType: string, text: string) => {
    if (!vkStore.bridge) {
      // Fallback to native share
      return shareNative(text)
    }

    try {
      await vkStore.bridge.send('VKWebAppShare', {
        link: 'https://vk.ru/app53942833',
        title: 'MBTI Personality Quiz',
        text
      })

      trackEvent('vk_share_success', { personality_type: personalityType })
      uiStore.showSuccess('Shared successfully!')

      return true
    } catch (error) {
      console.error('Failed to share:', error)
      // Fallback to native share
      return shareNative(text)
    }
  }

  /**
   * Native share fallback
   */
  const shareNative = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MBTI Personality Quiz Results',
          text,
          url: window.location.href
        })
        return true
      } catch (error) {
        return false
      }
    }
    return false
  }

  /**
   * Show notification
   */
  const showNotification = async (message: string) => {
    if (!vkStore.bridge) {
      uiStore.showInfo(message)
      return
    }

    try {
      await vkStore.bridge.send('VKWebAppShowNotification', {
        text: message
      })
    } catch (error) {
      // Fallback to our notification system
      uiStore.showInfo(message)
    }
  }

  /**
   * Check if running in VK environment
   */
  const isVKEnvironment = () => {
    if (typeof window === 'undefined') return false

    return (
      window.location.hostname.includes('vk.ru') ||
      window.location.search.includes('vk_') ||
      typeof (window as any).vkBridge !== 'undefined'
    )
  }

  return {
    // State
    isVKPlatform: computed(() => vkStore.isVKPlatform),
    isInitialized: computed(() => vkStore.isInitialized),
    vkUser: computed(() => vkStore.vkUser),
    isLoading: computed(() => vkStore.isLoading),

    // Actions
    initBridge,
    getUserInfo,
    showOrderBox,
    shareResults,
    showNotification,
    isVKEnvironment
  }
}
