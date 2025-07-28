import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
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
  },
  preview: {
    port: 4173,
    open: true
  },
  optimizeDeps: {
    include: ['jspdf']
  }
}); 