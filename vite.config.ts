import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/unrealdice-icon.svg'],
      manifest: {
        name: 'unrealDice',
        short_name: 'unrealDice',
        description: 'Offline dice tools for tabletop games and quick decisions.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0d1018',
        theme_color: '#0d1018',
        icons: [
          {
            src: '/icons/unrealdice-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/unrealdice-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/unrealdice-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
