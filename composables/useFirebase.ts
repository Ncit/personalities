import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAnalytics, logEvent, setUserId, setUserProperties, type Analytics } from 'firebase/analytics'
import { getPerformance, type FirebasePerformance } from 'firebase/performance'

export const useFirebase = () => {
  const config = useRuntimeConfig()
  let app: FirebaseApp | null = null
  let analytics: Analytics | null = null
  let performance: FirebasePerformance | null = null

  const initialize = () => {
    if (typeof window === 'undefined') return

    try {
      const firebaseConfig = {
        apiKey: config.public.firebase.apiKey,
        authDomain: config.public.firebase.authDomain,
        projectId: config.public.firebase.projectId,
        storageBucket: config.public.firebase.storageBucket,
        messagingSenderId: config.public.firebase.messagingSenderId,
        appId: config.public.firebase.appId,
        measurementId: config.public.firebase.measurementId
      }

      app = initializeApp(firebaseConfig)

      try {
        analytics = getAnalytics(app)
        console.log('✅ Firebase Analytics initialized')
      } catch (error) {
        console.warn('⚠️ Firebase Analytics initialization failed:', error)
      }

      try {
        performance = getPerformance(app)
        console.log('✅ Firebase Performance initialized')
      } catch (error) {
        console.warn('⚠️ Firebase Performance initialization failed:', error)
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error)
    }
  }

  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (!analytics) return

    try {
      logEvent(analytics, eventName, parameters)
    } catch (error) {
      console.warn('Failed to log event:', error)
    }
  }

  const trackQuizEvent = (action: string, quizType: string | null = null, questionNumber: number | null = null) => {
    const parameters: Record<string, any> = {}
    if (quizType) parameters.quiz_type = quizType
    if (questionNumber) parameters.question_number = questionNumber

    trackEvent(`quiz_${action}`, parameters)
  }

  const trackError = (error: Error, context: Record<string, any> = {}) => {
    trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })
  }

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', { page_name: pageName })
  }

  const setUser = (userId: string) => {
    if (!analytics) return

    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.warn('Failed to set user ID:', error)
    }
  }

  const setProperties = (properties: Record<string, any>) => {
    if (!analytics) return

    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.warn('Failed to set user properties:', error)
    }
  }

  return {
    initialize,
    trackEvent,
    trackQuizEvent,
    trackError,
    trackPageView,
    setUser,
    setProperties
  }
}
