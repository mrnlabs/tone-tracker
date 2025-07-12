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
  define: {
    // Enable Vue template compilation
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  server: {
    // Reduce preload warnings in development
    fs: {
      strict: false
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