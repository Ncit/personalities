export const useAnalytics = () => {
  const config = useRuntimeConfig()

  /**
   * Track custom event
   */
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return

    try {
      // Firebase Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, parameters)
      }

      // VK Analytics
      if ((window as any).vkBridge) {
        try {
          (window as any).vkBridge.send('VKWebAppTrackEvent', {
            event_name: eventName,
            event_params: parameters
          })
        } catch (error) {
          // Silently fail for VK analytics
        }
      }

      // Console log in development
      if (process.dev) {
        console.log('Analytics Event:', eventName, parameters)
      }
    } catch (error) {
      console.warn('Failed to track event:', error)
    }
  }

  /**
   * Track page view
   */
  const trackPageView = (pageName: string) => {
    trackEvent('page_view', {
      page_name: pageName,
      page_location: window.location.href
    })
  }

  /**
   * Track quiz event
   */
  const trackQuizEvent = (action: string, parameters: Record<string, any> = {}) => {
    trackEvent(`quiz_${action}`, parameters)
  }

  /**
   * Track error
   */
  const trackError = (error: Error, context: Record<string, any> = {}) => {
    trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  /**
   * Set user ID
   */
  const setUserId = (userId: string) => {
    if (typeof window === 'undefined') return

    try {
      if ((window as any).gtag) {
        (window as any).gtag('config', config.public.firebaseMeasurementId, {
          user_id: userId
        })
      }
    } catch (error) {
      console.warn('Failed to set user ID:', error)
    }
  }

  /**
   * Set user properties
   */
  const setUserProperties = (properties: Record<string, any>) => {
    if (typeof window === 'undefined') return

    try {
      if ((window as any).gtag) {
        (window as any).gtag('set', 'user_properties', properties)
      }
    } catch (error) {
      console.warn('Failed to set user properties:', error)
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackQuizEvent,
    trackError,
    setUserId,
    setUserProperties
  }
}
