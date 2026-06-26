import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon.png',
        'apple-touch-icon-180x180.png',
        'pwa-64x64.png',
        'pwa-192.png',
        'pwa-192x192.png',
        'pwa-512.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
      ],
      manifest: {
        name: 'Finote — Finance Tracker',
        short_name: 'Finote',
        description: 'Catat keuanganmu dengan mudah dan cerdas. Kelola pemasukan, pengeluaran, tabungan, dan catatan dalam satu dashboard.',
        theme_color: '#6366F1',
        background_color: '#0F172A',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'id',
        categories: ['finance', 'productivity'],
        screenshots: [],
        icons: [
          { src: '/pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
          { src: '/pwa-192.png',              sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png',              sizes: '512x512', type: 'image/png' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Tambah Pemasukan',
            short_name: 'Pemasukan',
            url: '/income',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }],
          },
          {
            name: 'Tambah Pengeluaran',
            short_name: 'Pengeluaran',
            url: '/expenses',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }],
          },
          {
            name: 'Lihat Dashboard',
            short_name: 'Dashboard',
            url: '/',
            icons: [{ src: '/pwa-192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        skipWaiting: false,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],

  build: {
    // Raise warning threshold slightly (vendor chunks can legitimately be larger)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Group node_modules into logical chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
              return 'vendor-react'
            }
            if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) {
              return 'vendor-charts'
            }
            if (id.includes('/@supabase/')) {
              return 'vendor-supabase'
            }
            if (id.includes('/date-fns/')) {
              return 'vendor-date'
            }
            // Remaining node_modules → vendor chunk
            return 'vendor'
          }
        },
      },
    },
  },
})
