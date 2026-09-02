import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Панель — окремий застосунок. Її код не потрапляє в бандл сайту,
// а сайт не тягне за собою адмінку.
export default defineConfig({
  root: 'admin',
  base: '/admin/',
  plugins: [react()],
  build: {
    outDir: '../dist/admin',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8877',
    },
  },
})
