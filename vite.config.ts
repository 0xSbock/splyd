// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [wasm(), react()],

  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
})
