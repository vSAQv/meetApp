import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // REST API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // WebSocket (если позже включим real-time на клиенте)
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
      // Статика для фото
      '/photos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  }
})

