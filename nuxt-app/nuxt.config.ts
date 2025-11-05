// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],

  // Components auto-import configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  // Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: true
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.json',
        name: 'English'
      },
      {
        code: 'ru',
        file: 'ru.json',
        name: 'Русский'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  // App configuration
  app: {
    head: {
      title: 'MBTI Personality Quiz',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Discover your MBTI personality type with comprehensive assessment'
        },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
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
        appId: process.env.NUXT_PUBLIC_VK_APP_ID || '54109191'
      }
    }
  },

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['jspdf']
    }
  },

  // SSR configuration
  ssr: true,

  // Experimental features
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  compatibilityDate: '2024-11-05'
})
