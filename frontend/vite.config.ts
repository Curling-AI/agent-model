import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
      ],
    },
  },
  resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}
})
