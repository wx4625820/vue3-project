import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:8099',
        changeOrigin: true,
        rewrite: path => path,
      },
      '/file': {
        target: 'http://localhost:8099', // ✅ 后端服务地址
        changeOrigin: true,
        rewrite: path => path,
      },
       '/rag': {
        target: 'http://localhost:8099', // ✅ 后端服务地址
        changeOrigin: true,
        rewrite: path => path,
      }
    }
  }
})
