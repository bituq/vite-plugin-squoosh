import { fileURLToPath, URL } from 'node:url'
import squooshPlugin from 'vite-plugin-squoosh'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), squooshPlugin({ codecs: {
    oxipng: {
      level: 3
    }
  }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
