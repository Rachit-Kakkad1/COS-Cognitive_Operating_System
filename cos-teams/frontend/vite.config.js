import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/team': { target: 'http://localhost:8002', changeOrigin: true, ws: true },
      '/handoff': { target: 'http://localhost:8002', changeOrigin: true },
      '/recall': { target: 'http://localhost:8002', changeOrigin: true },
      '/timeline': { target: 'http://localhost:8002', changeOrigin: true },
      '/sync': { target: 'http://localhost:8002', changeOrigin: true },
      '/health': { target: 'http://localhost:8002', changeOrigin: true },
    },
  },
})
