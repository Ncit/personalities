import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: [
        'defaults',
        'not IE 11',
        'Android >= 4.4',
        'Chrome >= 51',
        'Safari >= 10',
        'Firefox >= 54',
        'Edge >= 15'
      ],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'core-js/features/promise',
        'core-js/features/object/assign',
        'core-js/features/array/find',
        'core-js/features/array/includes',
        'core-js/features/string/includes',
        'core-js/features/string/starts-with',
        'core-js/features/string/ends-with'
      ],
      polyfills: [
        'es.promise',
        'es.object.assign',
        'es.array.find',
        'es.array.includes',
        'es.string.includes',
        'es.string.starts-with',
        'es.string.ends-with'
      ]
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['jspdf'],
          quiz: ['./src/modules/quiz/QuizEngine.js'],
          analytics: ['./src/modules/analytics/AnalyticsEngine.js']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3001,
    open: true,
    host: true,
    allowedHosts: [
      'localhost', // Typically allowed by default
      '758e0904d7c6.ngrok-free.app' // Add your ngrok host here
    ]
  },
  preview: {
    port: 4173,
    open: true
  },
  optimizeDeps: {
    include: ['jspdf']
  }
}); 