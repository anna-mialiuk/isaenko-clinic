import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Панель — окремий застосунок. Її код не потрапляє в бандл сайту,
// а сайт не тягне за собою адмінку.
export default defineConfig({
  root: 'admin',
  base: '/admin/',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      sass: {
        // Брейкпоінти спільні з сайтом — щоб не було двох систем
        // і питань, чому мобільна межа тут 560, а там 576.
        // SASS не бачить resolve.alias: шлях для @use задається
        // окремо, через loadPaths самого компілятора.
        loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
      },
    },
  },
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
