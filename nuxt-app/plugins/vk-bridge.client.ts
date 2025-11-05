/**
 * VK Bridge Plugin
 * Loads and initializes VK Bridge SDK for VKontakte Mini Apps
 * Client-side only plugin
 */

export default defineNuxtPlugin(() => {
  const vkStore = useVKStore()

  // Load VK Bridge SDK script
  const loadVKBridge = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.vkBridge) {
        resolve(window.vkBridge)
        return
      }

      // Create script element
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js'
      script.async = true

      script.onload = () => {
        if (window.vkBridge) {
          console.log('VK Bridge SDK loaded successfully')
          resolve(window.vkBridge)
        } else {
          reject(new Error('VK Bridge not found after script load'))
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load VK Bridge SDK'))
      }

      document.head.appendChild(script)
    })
  }

  // Initialize VK Bridge if we're in VK environment
  const initVKBridge = async () => {
    try {
      // Check if we're in VK Mini App environment
      const urlParams = new URLSearchParams(window.location.search)
      const vkParams = urlParams.get('vk_platform') || urlParams.get('vk_user_id')

      if (!vkParams) {
        console.log('Not running in VK environment')
        return
      }

      // Load VK Bridge
      const bridge = await loadVKBridge()

      // Send init event
      await bridge.send('VKWebAppInit')
      console.log('VK Bridge initialized')

      // Update store to indicate VK platform
      vkStore.setVKPlatform(true)

      // Get VK user info
      try {
        const user = await bridge.send('VKWebAppGetUserInfo')
        vkStore.setVKUser(user)
        console.log('VK user info loaded:', user)
      } catch (error) {
        console.warn('Failed to get VK user info:', error)
      }

      // Subscribe to VK Bridge events
      bridge.subscribe((event: any) => {
        if (event.detail.type === 'VKWebAppUpdateConfig') {
          // Handle app config updates
          console.log('VK config updated:', event.detail.data)
        }
      })

    } catch (error) {
      console.error('Failed to initialize VK Bridge:', error)
    }
  }

  // Initialize on mount
  if (process.client) {
    initVKBridge()
  }

  return {
    provide: {
      vkBridge: {
        isReady: () => !!window.vkBridge,
        send: (method: string, params?: any) => {
          if (window.vkBridge) {
            return window.vkBridge.send(method, params)
          }
          return Promise.reject(new Error('VK Bridge not initialized'))
        }
      }
    }
  }
})

// Extend window interface for TypeScript
declare global {
  interface Window {
    vkBridge?: any
  }
}
