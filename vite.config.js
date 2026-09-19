import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // '@' maps to 'src/' for clean imports: import Button from '@/components/ui/Button'
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api requests to backend in development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy n8n chat webhook — avoids CORS in development
      '/n8n-chat': {
        target: 'https://masumrezamunna.app.n8n.cloud',
        changeOrigin: true,
        rewrite: () =>
          '/webhook/82c06985-3684-4bab-a047-1558f36d7961/chat',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
