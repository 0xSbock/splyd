// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    wasm(),
    react(),
    // FIXME: properly set up te pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'splyd',
        short_name: 'splyd',
        description: 'TODO',
        theme_color: '#000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
  build: {
    target: 'es2022',
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
})
