import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import autoprefixer from 'autoprefixer'
import path from 'path'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
  ],
  css: {
    // postcss: {
    //   plugins: [
    //     autoprefixer(),
    //   ],
    // },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
