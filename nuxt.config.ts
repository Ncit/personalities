// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true
  },

  // Pinia configuration
  pinia: {
    storesDirs: ['./stores/**']
  },

  // App configuration
  app: {
    head: {
      title: 'Personality Types Quiz - 16 Personality Types',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'A comprehensive personality assessment platform with multiple specialized quizzes'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ],
      script: [
        // VK ID SDK for web authentication
        {
          src: 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js',
          defer: true
        }
      ]
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB773kQHk-jLJeSwYhCluXXk1r6CEOuR8A',
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nikitaproject-b0a52.firebaseapp.com',
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || 'nikitaproject-b0a52',
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nikitaproject-b0a52.firebasestorage.app',
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '188919966813',
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '1:188919966813:web:748cc6a6354d672173f1b4',
        measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-TZ5LN0BB9L'
      },
      vk: {
        appId: process.env.NUXT_PUBLIC_VK_APP_ID || '54109191',
        redirectUrl: process.env.NUXT_PUBLIC_VK_REDIRECT_URL || 'https://nikmobdev.ru/personalities/'
      }
    }
  },

  // Build configuration
  build: {
    transpile: ['@vkid/sdk']
  },

  // Vite configuration
  vite: {
    define: {
      'process.env.DEBUG': false
    }
  },

  // SSR configuration - disabled for client-heavy interactive app
  ssr: false,

  // Nitro configuration for deployment
  nitro: {
    preset: 'vercel'
  }
})
