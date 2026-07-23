import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://backend:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Fixes Docker exposure by listening on 0.0.0.0
      port: 3000, // Keeps your port consistent
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === 'true', 
      },
      
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: proxyTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
