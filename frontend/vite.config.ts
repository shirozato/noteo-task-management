import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Noteo',
        short_name: 'Noteo',
        description: 'Привычки, задачи и сон — в одном месте',
        theme_color: '#07081a',
        background_color: '#07081a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  server: {
    proxy: {
      '/task': 'http://localhost:8000',
      '/habit': 'http://localhost:8000',
      '/sleep': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/user': 'http://localhost:8000',
    },
  },
})
