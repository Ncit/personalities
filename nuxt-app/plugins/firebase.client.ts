/**
 * Firebase Plugin
 * Initializes Firebase Analytics and Performance Monitoring
 * Client-side only plugin
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import { getPerformance, type FirebasePerformance } from 'firebase/performance'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Type guard for firebase config
  const firebaseConfig = config.public.firebase as any

  // Only initialize if Firebase config is available
  if (!firebaseConfig?.apiKey) {
    console.warn('Firebase config not found. Analytics disabled.')
    return {
      provide: {
        analytics: null,
        performance: null
      }
    }
  }

  try {
    // Initialize Firebase
    const app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId
    })

    // Initialize Analytics
    let analytics: Analytics | null = null
    let performance: FirebasePerformance | null = null

    try {
      analytics = getAnalytics(app)
      console.log('Firebase Analytics initialized')
    } catch (error) {
      console.warn('Failed to initialize Firebase Analytics:', error)
    }

    // Initialize Performance Monitoring
    try {
      performance = getPerformance(app)
      console.log('Firebase Performance initialized')
    } catch (error) {
      console.warn('Failed to initialize Firebase Performance:', error)
    }

    return {
      provide: {
        analytics,
        performance
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return {
      provide: {
        analytics: null,
        performance: null
      }
    }
  }
})
