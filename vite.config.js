import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Fix Vue runtime compilation warning
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // Use modern Sass API
      }
    }
  },
  define: {
    // Enable Vue template compilation
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  optimizeDeps: {
    exclude: ['chunk-EAYEJSHS']
  },
  server: {
    // Reduce preload warnings in development
    fs: {
      strict: false
    },
    // Add security headers
    headers: {
      // Content Security Policy
      'Content-Security-Policy': process.env.NODE_ENV === 'production' 
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:8080 https://*.amazonaws.com https://api.github.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* ws://localhost:*",
      // Other security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
    }
  },
  build: {
    // Reduce preload links generation
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        // Reduce chunk size to avoid preload warnings
        manualChunks: {
          vendor: ['vue', 'pinia', 'vue-router'],
          primevue: ['primevue/config', 'primevue/toastservice']
        }
      }
    }
  }
})