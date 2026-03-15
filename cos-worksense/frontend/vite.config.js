import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      '/intervention': { target: 'http://localhost:8004', changeOrigin: true, ws: true },
      '/guardian': { target: 'http://localhost:8004', changeOrigin: true, ws: true },
      '/auth': { target: 'http://localhost:8004', changeOrigin: true },
      '/org': { target: 'http://localhost:8004', changeOrigin: true },
      '/employee': { target: 'http://localhost:8004', changeOrigin: true },
      '/manager': { target: 'http://localhost:8004', changeOrigin: true },
      '/worksense': { target: 'http://localhost:8004', changeOrigin: true },
      '/health': { target: 'http://localhost:8004', changeOrigin: true },
      '/memory': { target: 'http://localhost:8004', changeOrigin: true },
      '/hotkey': { target: 'http://localhost:8004', changeOrigin: true },
    },
  },
})
