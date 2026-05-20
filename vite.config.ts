import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Все запросы /auth, /users, /employees и т.д. проксируются на бэкенд
      // Фронт думает что обращается к localhost:5173 — cookie работает как same-site
      '/auth': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/employees': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/courses': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/course-assignments': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/tests': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/notifications': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})