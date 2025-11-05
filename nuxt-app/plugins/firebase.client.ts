/**
 * Firebase Plugin
 * Initializes Firebase Analytics and Performance Monitoring
 * Client-side only plugin
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getPerformance, Performance } from 'firebase/performance'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Only initialize if Firebase config is available
  if (!config.public.firebase.apiKey) {
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
      apiKey: config.public.firebase.apiKey,
      authDomain: config.public.firebase.authDomain,
      projectId: config.public.firebase.projectId,
      storageBucket: config.public.firebase.storageBucket,
      messagingSenderId: config.public.firebase.messagingSenderId,
      appId: config.public.firebase.appId,
      measurementId: config.public.firebase.measurementId
    })

    // Initialize Analytics
    let analytics: Analytics | null = null
    let performance: Performance | null = null

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
